import { Appearance } from "react-native";
import { create } from "zustand";

import { SettingsStorage } from "@/storage/settings.storage";
import { createTheme } from "@/theme";
import { AppTheme, ThemeMode } from "@/types/theme.types";

type SettingsStore = {
  mode: ThemeMode;
  theme: AppTheme;

  setMode: (mode: ThemeMode) => Promise<void>;

  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
};

const DEFAULT_MODE: ThemeMode = "system";

const resolveMode = (mode: ThemeMode): "light" | "dark" => {
  if (mode !== "system") return mode;

  const system = Appearance.getColorScheme() ?? "light";

  return system === "dark" ? "dark" : "light";
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  mode: DEFAULT_MODE,
  theme: createTheme(resolveMode(DEFAULT_MODE)),

  setMode: async (mode) => {
    await SettingsStorage.setThemeMode(mode);

    set({
      mode,
      theme: createTheme(resolveMode(mode)),
    });
  },

  hydrate: async () => {
    const mode = await SettingsStorage.getThemeMode();

    set({
      mode,
      theme: createTheme(resolveMode(mode)),
    });
  },

  reset: async () => {
    await SettingsStorage.clear();

    set({
      mode: DEFAULT_MODE,
      theme: createTheme(resolveMode(DEFAULT_MODE)),
    });
  },
}));

export const useTheme = () => useSettingsStore((s) => s.theme);
