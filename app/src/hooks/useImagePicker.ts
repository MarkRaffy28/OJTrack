import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

export type ImagePickerResult = {
  uri: string;
  width: number;
  height: number;
  mimeType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
};

export function useImagePicker() {
  const [image, setImage] = useState<ImagePickerResult | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const launchPicker = useCallback(
    async (
      launcher: typeof ImagePicker.launchImageLibraryAsync,
      selectionLimit?: number,
    ) => {
      setIsPicking(true);

      try {
        const result = await launcher({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 1,
          selectionLimit,
        });

        if (result.canceled || !result.assets[0]) {
          return null;
        }

        const asset = result.assets[0];

        const selectedImage: ImagePickerResult = {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType,
          fileName: asset.fileName,
          fileSize: asset.fileSize,
        };

        setImage(selectedImage);

        return selectedImage;
      } finally {
        setIsPicking(false);
      }
    },
    [],
  );

  const pickFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return null;
    }

    return await launchPicker(ImagePicker.launchImageLibraryAsync, 1);
  }, [launchPicker]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      return null;
    }

    return await launchPicker(ImagePicker.launchCameraAsync);
  }, [launchPicker]);

  const reset = useCallback(() => {
    setImage(null);
  }, []);

  return {
    image,
    isPicking,
    pickFromLibrary,
    takePhoto,
    reset,
  };
}
