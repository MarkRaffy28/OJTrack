import { Appearance } from "react-native";
import { create } from "zustand";

import { SettingsStorage } from "@/storage/settings.storage";
import { createTheme } from "@/theme";
import { AppTheme, ThemeMode } from "@/types/theme.types";
import { ReportTemplates } from "@/schemas/report.schema";

type SettingsState = {
  mode: ThemeMode;
  theme: AppTheme;
  reportTemplates: ReportTemplates;
  apiUrl: string;
};

type SettingsActions = {
  setMode: (mode: ThemeMode) => Promise<void>;
  setApiUrl: (apiUrl: string) => Promise<void>;

  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
  setReportTemplates: (reportTemplates: ReportTemplates) => void;
};

type SettingsStore = SettingsState & SettingsActions;

const DEFAULT_MODE: ThemeMode = "system";
const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const EMPTY_TEMPLATES: ReportTemplates = { daily: null, weekly: null, monthly: null, terminal: null };

const resolveMode = (mode: ThemeMode): "light" | "dark" => {
  if (mode !== "system") return mode;

  const system = Appearance.getColorScheme() ?? "light";

  return system === "dark" ? "dark" : "light";
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  mode: DEFAULT_MODE,
  theme: createTheme(resolveMode(DEFAULT_MODE)),
  reportTemplates: EMPTY_TEMPLATES,
  apiUrl: DEFAULT_API_URL,
  setReportTemplates: (reportTemplates) => set({ reportTemplates }),

  setMode: async (mode) => {
    await SettingsStorage.setThemeMode(mode);

    set({
      mode,
      theme: createTheme(resolveMode(mode)),
    });
  },

  setApiUrl: async (apiUrl) => {
    const normalizedApiUrl = apiUrl.trim().replace(/\/$/, "");
    await SettingsStorage.setApiUrl(normalizedApiUrl);
    set({ apiUrl: normalizedApiUrl });
  },

  hydrate: async () => {
    const [mode, storedApiUrl] = await Promise.all([
      SettingsStorage.getThemeMode(),
      SettingsStorage.getApiUrl(),
    ]);

    set({
      mode,
      theme: createTheme(resolveMode(mode)),
      apiUrl: storedApiUrl ?? DEFAULT_API_URL,
    });
  },

  reset: async () => {
    await SettingsStorage.clear();

    set({
      mode: DEFAULT_MODE,
      theme: createTheme(resolveMode(DEFAULT_MODE)),
      apiUrl: DEFAULT_API_URL,
    });
  },
}));

export const useMode = () => useSettingsStore((s) => s.mode);
export const useTheme = () => useSettingsStore((s) => s.theme);

export const useSetMode = () => useSettingsStore((s) => s.setMode);
export const useApiUrl = () => useSettingsStore((s) => s.apiUrl);
export const useSetApiUrl = () => useSettingsStore((s) => s.setApiUrl);
export const useResetTheme = () => useSettingsStore((s) => s.reset);
export const useReportTemplates = () => useSettingsStore((s) => s.reportTemplates);
