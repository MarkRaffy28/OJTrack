import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from "react-native-paper";
import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from "@material/material-color-utilities";

import { Colors } from "@/constants/colors.constants";

export function createTheme(mode: "light" | "dark"): MD3Theme {
  const scheme = themeFromSourceColor(argbFromHex(Colors.BRAND)).schemes[mode];

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

      shadow: "#000000",
      scrim: "#000000",
    },
  };
}
