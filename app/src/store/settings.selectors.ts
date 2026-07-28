import { useSettingsStore } from "./settings.store";

export const useTheme = () => useSettingsStore(s => s.theme);