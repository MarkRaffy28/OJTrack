import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "@/store/settings.store";

export const useAppStyles = () => {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeView: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },

        appView: {
          flex: 1,
          paddingHorizontal: 12,
        },
      }),
    [theme],
  );

  return {
    ...styles,
  };
};
