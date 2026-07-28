import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeMode } from "@/types/theme.types";

const KEYS = {
  THEME_MODE: "theme_mode",
}

export const SettingsStorage = {
  getThemeMode: async (): Promise<ThemeMode> =>
    (await AsyncStorage.getItem(KEYS.THEME_MODE)) as ThemeMode ?? "system",

  setThemeMode: async (mode: ThemeMode): Promise<void> =>
    await AsyncStorage.setItem(KEYS.THEME_MODE, mode),

  clear: async (): Promise<void> => await AsyncStorage.removeItem(KEYS.THEME_MODE),
};
