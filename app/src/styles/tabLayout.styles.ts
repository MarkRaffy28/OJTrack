import { StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/store/settings.store";

export const useTabLayoutStyles = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    tabBarContainer: {
      backgroundColor: theme.colors.elevation.level1,
      borderTopWidth: 0,
      elevation: 0,
      height: 60,
      paddingTop: 3,
    },
    tabBarLabel: {
      fontFamily: theme.fonts.labelMedium.fontFamily,
      fontSize: theme.fonts.labelMedium.fontSize,
      fontWeight: theme.fonts.labelMedium.fontWeight,
      marginTop: 3,
    },
    tabBarScene: {
      backgroundColor: theme.colors.background,
    },
    tabScreenView: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      height: 32,
      overflow: "hidden",
    },
  });

  return {
    ...styles,

    tabBar: {
      activeTint: theme.colors.primary,
      container: styles.tabBarContainer,
      label: styles.tabBarLabel,
      scene: styles.tabBarScene,
    },

    tabScreen: {
      icon: (focused: boolean): string =>
        focused ? theme.colors.primary : theme.colors.onSurfaceDisabled,

      view: (focused: boolean): ViewStyle => ({
        ...styles.tabScreenView,

        backgroundColor: focused ? theme.colors.surfaceVariant : "transparent",
        paddingHorizontal: focused ? 16 : 0,
        minWidth: focused ? 60 : 24,
      }),
    },
  };
};
