import { useCallback, useRef, useState } from "react";
import { CameraType, CameraView } from "expo-camera";

import type { ImagePickerResult } from "@/types/media.types";

export function useCamera() {
  const cameraRef = useRef<CameraView>(null);

  const [facing, setFacing] = useState<CameraType>("back");
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const takePhoto = useCallback(async (): Promise<ImagePickerResult | null> => {
    if (!cameraRef.current || isCapturing) {
      return null;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
      });

      if (!photo) {
        return null;
      }

      return {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        fileSize: null,
      };
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  return {
    cameraRef,
    facing,
    isCapturing,
    toggleFacing,
    takePhoto,
  };
}
