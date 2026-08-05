import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { StatusBarStyle } from "expo-status-bar";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

import { useTheme } from "@/store/settings.selectors";

export const useRootLayoutStyles = () => {
  const theme = useTheme();

  const base = theme.dark ? DarkTheme : DefaultTheme;

  const navTheme = useMemo(
    () => ({
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.onSurface,
        border: theme.colors.outline,
        primary: theme.colors.primary,
      },
    }),
    [theme, base],
  );

  const styles = StyleSheet.create({
    rootView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return {
    ...styles,
    navTheme,

    stack: {
      content: {
        backgroundColor: theme.colors.background,
      },
    },

    statusBar: {
      container: (theme.dark ? "light" : "dark") as StatusBarStyle,
      background: theme.colors.background,
    },
  };
};
