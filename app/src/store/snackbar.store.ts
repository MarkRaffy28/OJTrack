import { create } from "zustand";

import { Props as SnackbarProps } from "@/components/ui/Snackbar";

type SnackbarState = {
  visible: boolean;
  type: SnackbarProps["type"];
  message: string;
  duration: number;
};

type SnackbarActions = {
  showSnackbar: (
    message: string,
    type?: SnackbarProps["type"],
    duration?: number,
  ) => void;

  hideSnackbar: () => void;
};

type SnackbarStore = SnackbarState & SnackbarActions;

const DEFAULT_STATE: SnackbarState = {
  visible: false,
  type: "success",
  message: "",
  duration: 3000,
};

export const useSnackbarStore = create<SnackbarStore>((set) => ({
  ...DEFAULT_STATE,

  showSnackbar: (message, type = "success", duration = 3000) => {
    set({
      visible: true,
      type,
      message,
      duration,
    });
  },

  hideSnackbar: () => {
    set({
      visible: false,
    });
  },
}));

export const useSnackbarVisible = () => useSnackbarStore((s) => s.visible);
export const useSnackbarType = () => useSnackbarStore((s) => s.type);
export const useSnackbarMessage = () => useSnackbarStore((s) => s.message);
export const useSnackbarDuration = () => useSnackbarStore((s) => s.duration);

export const useShowSnackbar = () => useSnackbarStore((s) => s.showSnackbar);
export const useHideSnackbar = () => useSnackbarStore((s) => s.hideSnackbar);
