import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SaveFormat, useImageManipulator } from "expo-image-manipulator";
import { Button, Surface, Text, useTheme } from "react-native-paper";
import Slider from "@react-native-community/slider";

export interface ImageEditorResult {
  uri: string;
  width: number;
  height: number;
}

export interface ImageEditorProps {
  uri: string;

  cropSize?: number;
  outputSize?: number;
  compression?: number;

  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;

  isSaving?: boolean;
  onCancel?: () => void;
  onComplete?: (result: ImageEditorResult) => void;
}

const DEFAULT_CROP_SIZE = 320;
const DEFAULT_OUTPUT_SIZE = 512;
const DEFAULT_COMPRESSION = 0.8;
const DEFAULT_MIN_ZOOM = 1;
const DEFAULT_MAX_ZOOM = 3;
const DEFAULT_ZOOM_STEP = 0.05;

export function ImageEditor({
  uri,

  cropSize = DEFAULT_CROP_SIZE,
  outputSize = DEFAULT_OUTPUT_SIZE,
  compression = DEFAULT_COMPRESSION,

  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
  zoomStep = DEFAULT_ZOOM_STEP,

  isSaving = false,
  onCancel,
  onComplete,
}: ImageEditorProps) {
  const theme = useTheme();
  const context = useImageManipulator(uri);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const [zoom, setZoom] = useState(minZoom);
  const [rotation, setRotation] = useState(0);

  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    Image.getSize(
      uri,
      (width, height) => setImageSize({ width, height }),
      () => setImageSize({ width: cropSize, height: cropSize }),
    );
  }, [uri, cropSize]);

  useEffect(() => {
    context.reset();

    setZoom(minZoom);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, [uri, context, minZoom]);

  const baseScale = useMemo(() => {
    if (!imageSize.width || !imageSize.height) return 1;

    return Math.max(cropSize / imageSize.width, cropSize / imageSize.height);
  }, [imageSize, cropSize]);

  const displayWidth = imageSize.width * baseScale * zoom;

  const displayHeight = imageSize.height * baseScale * zoom;

  const bounds = useMemo(() => {
    return {
      x: Math.max(0, (displayWidth - cropSize) / 2),
      y: Math.max(0, (displayHeight - cropSize) / 2),
    };
  }, [displayWidth, displayHeight, cropSize]);

  const clampOffset = useCallback(
    (x: number, y: number) => ({
      x: Math.max(-bounds.x, Math.min(bounds.x, x)),

      y: Math.max(-bounds.y, Math.min(bounds.y, y)),
    }),
    [bounds],
  );

  const panGesture = Gesture.Pan().onChange((event) => {
    setOffset((current) =>
      clampOffset(current.x + event.changeX, current.y + event.changeY),
    );
  });

  const pinchGesture = Gesture.Pinch().onChange((event) => {
    setZoom((current) => {
      const next = current * event.scaleChange;

      return Math.max(minZoom, Math.min(maxZoom, next));
    });
  });

  const imageGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const handleZoomChange = useCallback(
    (value: number) => {
      setZoom(value);

      setOffset((current) => clampOffset(current.x, current.y));
    },
    [clampOffset],
  );

  const handleRotate = useCallback(() => {
    context.rotate(90);

    setRotation((current) => (current + 90) % 360);

    setOffset({ x: 0, y: 0 });
  }, [context]);

  const handleReset = useCallback(() => {
    context.reset();

    setZoom(minZoom);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, [context, minZoom]);

  const handleSave = useCallback(async () => {
    if (!imageSize.width || !imageSize.height || isSaving) {
      return;
    }

    const scale = baseScale * zoom;

    const cropWidth = cropSize / scale;
    const cropHeight = cropSize / scale;

    const originX = imageSize.width / 2 - cropWidth / 2 - offset.x / scale;

    const originY = imageSize.height / 2 - cropHeight / 2 - offset.y / scale;

    const safeOriginX = Math.max(0, Math.min(imageSize.width - cropWidth, originX));

    const safeOriginY = Math.max(0, Math.min(imageSize.height - cropHeight, originY));

    context.crop({
      originX: safeOriginX,
      originY: safeOriginY,
      width: cropWidth,
      height: cropHeight,
    });

    context.resize({
      width: outputSize,
      height: outputSize,
    });

    const rendered = await context.renderAsync();

    const result = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: compression,
    });

    onComplete?.({
      uri: result.uri,
      width: result.width,
      height: result.height,
    });
  }, [
    context,
    imageSize,
    baseScale,
    zoom,
    cropSize,
    offset,
    outputSize,
    compression,
    isSaving,
    onComplete,
  ]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
          Set your profile photo
        </Text>
        <Text
          variant="bodySmall"
          style={{
            color: theme.colors.onSurfaceVariant,
            marginTop: 4,
          }}
        >
          Zoom, pan, and rotate to frame your photo
        </Text>
      </View>

      {/* Editor Surface */}
      <Surface
        style={[
          styles.editorSurface,
          {
            width: cropSize,
            height: cropSize,
          },
        ]}
        elevation={2}
      >
        <GestureDetector gesture={imageGesture}>
          <View
            style={[
              styles.editor,
              {
                width: cropSize,
                height: cropSize,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Image
              source={{ uri }}
              resizeMode="cover"
              style={{
                width: displayWidth,
                height: displayHeight,
                transform: [
                  {
                    translateX: offset.x,
                  },
                  {
                    translateY: offset.y,
                  },
                  {
                    rotate: `${rotation}deg`,
                  },
                ],
              }}
            />

            {/* Crop boundary */}
            <View
              pointerEvents="none"
              style={[
                styles.cropFrame,
                {
                  width: cropSize,
                  height: cropSize,
                  borderColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </GestureDetector>
      </Surface>

      {/* Zoom Control */}
      <View style={styles.zoomSection}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
            Zoom
          </Text>
          <Text
            variant="labelLarge"
            style={{
              color: theme.colors.primary,
              fontWeight: "600",
            }}
          >
            {zoom.toFixed(2)}×
          </Text>
        </View>

        <Slider
          minimumValue={minZoom}
          maximumValue={maxZoom}
          step={zoomStep}
          value={zoom}
          onValueChange={handleZoomChange}
          disabled={isSaving}
          style={styles.slider}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.surfaceVariant}
          thumbTintColor={theme.colors.primary}
        />
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsRow}>
        <Button
          mode="outlined"
          onPress={handleReset}
          disabled={isSaving}
          icon="refresh"
          contentStyle={{ flexDirection: "row-reverse" }}
          style={{ flex: 1 }}
        >
          Reset
        </Button>

        <Button
          mode="outlined"
          onPress={handleRotate}
          disabled={isSaving}
          icon="rotate-right"
          contentStyle={{ flexDirection: "row-reverse" }}
          style={{ flex: 1 }}
        >
          Rotate
        </Button>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <Button
          mode="outlined"
          onPress={onCancel}
          disabled={isSaving}
          style={{ flex: 1 }}
        >
          Cancel
        </Button>

        <Button
          mode="contained"
          onPress={handleSave}
          disabled={isSaving}
          loading={isSaving}
          style={{ flex: 1 }}
          icon={!isSaving ? "check" : undefined}
          contentStyle={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!isSaving && "Save"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "flex-start",
    gap: 24,
  },

  header: {
    marginBottom: 8,
    alignItems: "center",
  },

  editorSurface: {
    borderRadius: 28,
    overflow: "hidden",
    alignSelf: "center",
  },

  editor: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  cropFrame: {
    position: "absolute",
    borderWidth: 3,
    borderRadius: 28,
  },

  zoomSection: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },

  slider: {
    width: "100%",
    height: 40,
  },

  controlsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    marginTop: 8,
  },
});
