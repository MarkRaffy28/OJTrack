import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from "@material/material-color-utilities";

import {
  COLORS,
  DARK_SHADE,
  LIGHT_SHADE,
  MATERIAL_COLORS,
  SEMANTIC_COlORS,
} from "@/constants/colors.constants";
import { AppColors, AppTheme } from "@/types/theme.types";

export function createTheme(mode: "light" | "dark"): AppTheme {
  const scheme = themeFromSourceColor(argbFromHex(COLORS.BRAND)).schemes[mode];
  const shade = mode === "light" ? LIGHT_SHADE : DARK_SHADE;

  const semanticSchemes = Object.fromEntries(
    Object.entries(SEMANTIC_COlORS).map(([key, hex]) => [
      key,
      themeFromSourceColor(argbFromHex(hex)).schemes[mode],
    ]),
  );

  const appColors = Object.fromEntries(
    Object.entries(MATERIAL_COLORS).map(([key, scale]) => [key, scale[shade]]),
  ) as AppColors;

  const base = mode === "light" ? MD3LightTheme : MD3DarkTheme;

  return {
    ...base,

    colors: {
      ...base.colors,

      primary: hexFromArgb(scheme.primary),
      onPrimary: hexFromArgb(scheme.onPrimary),
      primaryContainer: hexFromArgb(scheme.primaryContainer),
      onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),

      secondary: hexFromArgb(scheme.secondary),
      onSecondary: hexFromArgb(scheme.onSecondary),
      secondaryContainer: hexFromArgb(scheme.secondaryContainer),
      onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),

      tertiary: hexFromArgb(scheme.tertiary),
      onTertiary: hexFromArgb(scheme.onTertiary),
      tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
      onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),

      error: hexFromArgb(scheme.error),
      onError: hexFromArgb(scheme.onError),
      errorContainer: hexFromArgb(scheme.errorContainer),
      onErrorContainer: hexFromArgb(scheme.onErrorContainer),

      background: hexFromArgb(scheme.background),
      onBackground: hexFromArgb(scheme.onBackground),

      surface: hexFromArgb(scheme.surface),
      onSurface: hexFromArgb(scheme.onSurface),

      surfaceVariant: hexFromArgb(scheme.surfaceVariant),
      onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),

      outline: hexFromArgb(scheme.outline),
      outlineVariant: hexFromArgb(scheme.outlineVariant),

      inverseSurface: hexFromArgb(scheme.inverseSurface),
      inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
      inversePrimary: hexFromArgb(scheme.inversePrimary),

      success: hexFromArgb(semanticSchemes.success.primary),
      onSuccess: hexFromArgb(semanticSchemes.success.onPrimary),
      successContainer: hexFromArgb(semanticSchemes.success.primaryContainer),
      onSuccessContainer: hexFromArgb(semanticSchemes.success.onPrimaryContainer),

      warning: hexFromArgb(semanticSchemes.warning.primary),
      onWarning: hexFromArgb(semanticSchemes.warning.onPrimary),
      warningContainer: hexFromArgb(semanticSchemes.warning.primaryContainer),
      onWarningContainer: hexFromArgb(semanticSchemes.warning.onPrimaryContainer),

      info: hexFromArgb(semanticSchemes.info.primary),
      onInfo: hexFromArgb(semanticSchemes.info.onPrimary),
      infoContainer: hexFromArgb(semanticSchemes.info.primaryContainer),
      onInfoContainer: hexFromArgb(semanticSchemes.info.onPrimaryContainer),

      app: appColors,

      shadow: "#000000",
      scrim: "#000000",
    },
  };
}
