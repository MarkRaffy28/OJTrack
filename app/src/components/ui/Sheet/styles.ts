import { StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/store/settings.store";

export const useSheetStyles = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      padding: 16,
      paddingBottom: 40,
    },

    modalBackground: {
      backgroundColor: theme.colors.elevation.level2,
    },
    modalHandleIndicator: {
      backgroundColor: theme.colors.onSurfaceVariant,
    },

    sectionHeaderContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
      marginLeft: 6,
    },
    sectionHeaderTitle: {
      color: theme.colors.onSurfaceVariant,
    },

    title: {
      textAlign: "center",
      color: theme.colors.primary,
      marginBottom: 12,
    },
  });

  const {
    modalBackground,
    modalHandleIndicator,
    sectionHeaderContainer,
    sectionHeaderTitle,
    ...rest
  } = styles;

  return {
    ...rest,
    
    modal: {
      background: modalBackground,
      handleIndicator: modalHandleIndicator,
    },

    sectionHeader: {
      container: sectionHeaderContainer,
      title: sectionHeaderTitle,
    },
  };
};