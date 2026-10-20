import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeMode } from "@/types/theme.types";

const KEYS = {
  THEME_MODE: "theme_mode",
  API_URL: "api_url",
};

export const SettingsStorage = {
  getThemeMode: async () =>
    ((await AsyncStorage.getItem(KEYS.THEME_MODE)) as ThemeMode) ?? "system",
  getApiUrl: async () => await AsyncStorage.getItem(KEYS.API_URL),

  setThemeMode: async (mode: ThemeMode) =>
    await AsyncStorage.setItem(KEYS.THEME_MODE, mode),
  setApiUrl: async (apiUrl: string) => await AsyncStorage.setItem(KEYS.API_URL, apiUrl),

  clear: async () => await AsyncStorage.multiRemove([KEYS.THEME_MODE, KEYS.API_URL]),
};
