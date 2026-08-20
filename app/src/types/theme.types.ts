import { MATERIAL_COLORS } from "@/constants/colors.constants";
import type { MD3Theme } from "react-native-paper";

export type AppColors = {
  [K in keyof typeof MATERIAL_COLORS]: string;
};

export type CustomColors = MD3Theme["colors"] & {
  success: string;
  onSuccess: string;
  successContainer: string;
  onSuccessContainer: string;

  warning: string;
  onWarning: string;
  warningContainer: string;
  onWarningContainer: string;

  info: string;
  onInfo: string;
  infoContainer: string;
  onInfoContainer: string;

  app: AppColors;
};

export type AppTheme = Omit<MD3Theme, "colors"> & {
  colors: CustomColors;
};

export type ThemeMode = "system" | "light" | "dark";
