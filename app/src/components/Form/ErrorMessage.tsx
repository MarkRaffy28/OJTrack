import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";

import { ICON_SIZES } from "@/constants/icons.constants";
import { useFormContext } from "@/form/context";
import { useTheme } from "@/store/settings.store";

export function FormErrorMessage() {
  const theme = useTheme();

  const form = useFormContext();

  const error = form.state.errorMap.onSubmit;

  if (!error) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.errorContainer }]}>
      <Icon
        source="alert-circle"
        size={ICON_SIZES.md}
        color={theme.colors.onErrorContainer}
      />

      <Text
        variant="bodyMedium"
        style={[styles.text, { color: theme.colors.onErrorContainer }]}
      >
        {String(error)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  text: {
    flex: 1,
  },
});
