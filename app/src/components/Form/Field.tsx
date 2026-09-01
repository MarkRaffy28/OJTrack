import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { HelperText, Icon, Text, TextInput, TextInputProps } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

import { ICON_SIZES } from "@/constants/icons.constants";
import { Chip } from "@/components/ui/Chip";
import { useFieldContext } from "@/form/context";
import { useTheme } from "@/store/settings.store";

interface Props extends Omit<
  TextInputProps,
  "value" | "onChangeText" | "onBlur" | "error" | "label" | "mode"
> {
  label: string;
  icon: IconSource;
  secure?: boolean;
  mode?: "view" | "edit";
  verified?: boolean;
  onVerifyPress?: () => void;
}

export function FormField({
  label,
  icon,
  secure,
  mode = "edit",
  verified,
  onVerifyPress,
  ...props
}: Props) {
  const field = useFieldContext();
  const theme = useTheme();

  if (!field) {
    throw new Error("useFieldContext must be used within a Form");
  }

  const {
    value,
    meta: { errors, isTouched },
  } = field.state;

  const [secureTextEntry, setSecureTextEntry] = useState(secure);

  const error = isTouched && errors.length > 0 ? String(errors[0]?.message) : undefined;

  const iconColor = props.disabled
    ? theme.colors.onSurfaceDisabled
    : error
      ? theme.colors.error
      : theme.colors.primary;

  const labelColor = props.disabled
    ? theme.colors.onSurfaceDisabled
    : error
      ? theme.colors.error
      : theme.colors.onSurface;

  if (mode === "view") {
    return (
      <View style={[styles.viewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={[styles.viewIconBadge, { backgroundColor: theme.colors.surface }]}>
          <Icon
            source={icon}
            size={ICON_SIZES.lg}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.viewTextColumn}>
          <View style={styles.viewLabelRow}>
            <Text
              variant="labelMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {label}
            </Text>

            {verified === true && (
              <Chip
                text="Verified"
                variant="filled"
                tone="success"
                selected
                size="small"
                rightIcon="check-decagram"
              />
            )}
          </View>

          <Text
            variant="titleMedium"
            style={[styles.viewValue, { color: theme.colors.onSurface }]}
          >
            {String(value ?? "")}
          </Text>
        </View>

        {verified === false && (
          <Chip
            text="Verify"
            variant="filled"
            tone="warning"
            size="medium"
            leftIcon="alert-circle-outline"
            onPress={onVerifyPress}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Icon
          source={icon}
          size={ICON_SIZES.md}
          color={iconColor}
        />

        <Text
          variant="labelLarge"
          style={[styles.labelText, { color: labelColor }]}
        >
          {label}
        </Text>

        {verified === true && (
          <Chip
            text="Verified"
            variant="filled"
            tone="success"
            selected
            size="small"
            rightIcon="check-decagram"
          />
        )}
      </View>

      <TextInput
        {...props}
        mode="outlined"
        placeholder={props.placeholder ?? `Enter ${label}`}
        value={String(value ?? "")}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        error={!!error}
        secureTextEntry={secureTextEntry}
        outlineColor={theme.colors.outlineVariant}
        activeOutlineColor={theme.colors.primary}
        style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
        outlineStyle={styles.inputOutline}
        right={
          secure && (
            <TextInput.Icon
              icon={secureTextEntry ? "eye" : "eye-off"}
              onPress={() => setSecureTextEntry((prev) => !prev)}
            />
          )
        }
      />

      <HelperText type="error" visible={!!error} padding="none">
        {error}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  labelText: {
    fontWeight: "600",
  },
  input: {
    fontSize: 15,
  },
  inputOutline: {
    borderRadius: 16,
  },
  viewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  viewIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  viewTextColumn: {
    flex: 1,
    gap: 2,
  },
  viewLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewValue: {
    fontWeight: "700",
  },
});