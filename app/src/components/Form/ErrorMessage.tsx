import { Text } from "react-native-paper";

import { useFormContext } from "@/form/context";
import { useTheme } from "@/store/settings.store";

export function FormErrorMessage() {
  const theme = useTheme();

  const form = useFormContext();

  const error = form.state.errorMap.onSubmit;

  if (!error) return null;

  return <Text style={{ color: theme.colors.error }}>{error}</Text>;
}
