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

        fab: {
          position: "absolute",
          right: 16,
          bottom: 20,
        },

        listSubheaderContainer: {
          fontWeight: "bold",
        },
      }),
    [theme],
  );

  const { listSubheaderContainer, ...rest } = styles;

  return {
    ...rest,

    list: {
      subheader: {
        container: listSubheaderContainer,
      },
    },
  };
};
