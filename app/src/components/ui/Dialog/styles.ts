import { StyleSheet } from "react-native";

export const useDialogStyles = () => {
  const styles = StyleSheet.create({
    title: {
      textAlign: "center",
    },

    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
    },
  });

  return {
    ...styles,
  };
};
