import { create } from "zustand";

import type { ImagePickerResult } from "@/types/media.types";

type CameraState = {
  image: ImagePickerResult | null;
};

type CameraActions = {
  setImage: (image: ImagePickerResult) => void;
  clear: () => void;
};

type CameraStore = CameraState & CameraActions;

const DEFAULT_STATE: CameraState = {
  image: null,
};

export const useCameraStore = create<CameraStore>((set) => ({
  ...DEFAULT_STATE,

  setImage: (image) => set({ image }),

  clear: () => set(DEFAULT_STATE),
}));

export const useCameraImage = () => useCameraStore((s) => s.image);

export const useSetCameraImage = () => useCameraStore((s) => s.setImage);
export const useClearCameraImage = () => useCameraStore((s) => s.clear);
