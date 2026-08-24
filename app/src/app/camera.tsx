import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Redirect, router } from "expo-router";
import { IconButton, Portal, Surface } from "react-native-paper";

import { Dialog } from "@/components/ui/Dialog";
import { ICON_SIZES } from "@/constants/icons.constants";
import { useCamera } from "@/hooks/useCamera";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useSetCameraImage } from "@/store/camera.store";
import { useTheme } from "@/store/settings.store";

export default function CameraScreen() {
  if (!router.canGoBack()) {
    return <Redirect href="(tabs)/home" />;
  }

  const theme = useTheme();
  const isDesktop = useIsDesktop();

  const setImage = useSetCameraImage();

  const { cameraRef, facing, isCapturing, toggleFacing, takePhoto } = useCamera();

  const [permission, requestPermission] = useCameraPermissions();

  const [flashOn, setFlashOn] = useState(false);

  const handleCapture = useCallback(async () => {
    const image = await takePhoto();

    if (image) {
      setImage(image);
      router.back();
    }
  }, [takePhoto, setImage]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <Portal>
        <Dialog.Confirm
          visible
          title="Camera Permission Required"
          description="Camera permission is required to take a photo."
          cancelLabel="Cancel"
          actionLabel="Allow Camera"
          onCancel={handleCancel}
          onAction={requestPermission}
        />
      </Portal>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={flashOn}
      />

      {/* Back Button */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={ICON_SIZES.lg}
          iconColor={theme.colors.surface}
          onPress={handleCancel}
        />
      </View>

      {/* Mobile-only Top Controls */}
      {!isDesktop && (
        <View style={styles.topControls}>
          <Surface
            style={[
              styles.controlPill,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            elevation={2}
          >
            <IconButton
              icon={flashOn ? "flash" : "flash-off"}
              size={ICON_SIZES.md}
              iconColor={theme.colors.onSurfaceVariant}
              onPress={() => setFlashOn(!flashOn)}
              disabled={isCapturing}
            />

            <IconButton
              icon="camera-flip"
              size={ICON_SIZES.md}
              iconColor={theme.colors.onSurfaceVariant}
              onPress={toggleFacing}
              disabled={isCapturing}
            />
          </Surface>
        </View>
      )}

      {/* Bottom Capture Controls */}
      <View style={styles.controls}>
        <Surface
          style={[
            styles.captureButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
          elevation={4}
        >
          <IconButton
            icon="camera"
            size={ICON_SIZES.lg}
            iconColor={theme.colors.onPrimary}
            onPress={() => void handleCapture()}
            disabled={isCapturing}
          />
          {isCapturing && (
            <View style={styles.capturingIndicator}>
              <ActivityIndicator color={theme.colors.onPrimary} />
            </View>
          )}
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },

  header: {
    position: "absolute",
    top: 30,
    left: 0,
    zIndex: 10,
  },

  topControls: {
    position: "absolute",
    top: 60,
    right: 16,
    zIndex: 10,
  },

  controlPill: {
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  controls: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },

  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  capturingIndicator: {
    position: "absolute",
  },
});