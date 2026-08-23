import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { useTheme } from "@/store/settings.store";

type SnackbarType = "success" | "error" | "warning" | "info";

export const useSnackbarStyles = () => {
  const theme = useTheme();

  const colorMap = {
    success: {
      background: theme.colors.successContainer,
      text: theme.colors.onSuccessContainer,
    },
    error: {
      background: theme.colors.errorContainer,
      text: theme.colors.onErrorContainer,
    },
    warning: {
      background: theme.colors.warningContainer,
      text: theme.colors.onWarningContainer,
    },
    info: {
      background: theme.colors.infoContainer,
      text: theme.colors.onInfoContainer,
    },
  };

  const styles = StyleSheet.create({
    content: {
      flexDirection: "row",
      alignItems: "center",
    },
    innerContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
  });

  return {
    innerContainer: styles.innerContainer,

    container: (type: SnackbarType): ViewStyle => ({
      backgroundColor: colorMap[type].background,
    }),

    content: (type: SnackbarType): ViewStyle => ({
      ...styles.content,
      backgroundColor: colorMap[type].background,
    }),

    iconColor: (type: SnackbarType): string => colorMap[type].text,

    children: (type: SnackbarType): TextStyle => ({
      color: colorMap[type].text,
      marginLeft: 8,
    }),
  };
};
