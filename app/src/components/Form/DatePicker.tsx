import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { HelperText, Icon, Text, TextInput } from "react-native-paper";
import { DatePickerModal, DatePickerModalSingleProps } from "react-native-paper-dates";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

import { ICON_SIZES } from "@/constants/icons.constants";
import { useFieldContext } from "@/form/context";
import { useTheme } from "@/store/settings.store";
import { formatDateOnly, formatNamedDate } from "@/utils/date.util";

interface Props extends Omit<
  DatePickerModalSingleProps,
  "visible" | "date" | "onConfirm" | "onDismiss" | "mode" | "locale"
> {
  label: string;
  icon: IconSource;
  disabled?: boolean;
  mode?: "view" | "edit";
}

export function FormDatePicker({
  label,
  icon,
  disabled = false,
  mode = "edit",
  ...pickerProps
}: Props) {
  const field = useFieldContext();
  const theme = useTheme();

  if (!field) {
    throw new Error("useFieldContext must be used within a Form");
  }

  const [visible, setVisible] = useState(false);

  const {
    value,
    meta: { isTouched, errors },
  } = field.state;

  const error = isTouched && errors.length ? String(errors[0]?.message) : undefined;

  const selectedDate = typeof value === "string" && value ? new Date(value) : undefined;

  const iconColor = disabled
    ? theme.colors.onSurfaceDisabled
    : error
      ? theme.colors.error
      : theme.colors.primary;

  const labelColor = disabled
    ? theme.colors.onSurfaceDisabled
    : error
      ? theme.colors.error
      : theme.colors.onSurface;

  const handleOpen = () => {
    if (disabled) return;

    setVisible(true);
  };

  const handleDismiss = () => {
    setVisible(false);
    field.handleBlur();
    field.validate("blur");
  };

  const handleConfirm = ({ date }: { date?: Date }) => {
    setVisible(false);

    if (date) {
      field.handleChange(formatDateOnly(date));
    }

    field.handleBlur();
    field.validate("blur");
  };

  if (mode === "view") {
    return (
      <View style={[styles.viewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={[styles.viewIconBadge, { backgroundColor: theme.colors.surface }]}>
          <Icon source={icon} size={ICON_SIZES.lg} color={theme.colors.primary} />
        </View>

        <View style={styles.viewTextColumn}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>

          <Text
            variant="titleMedium"
            style={[styles.viewValue, { color: theme.colors.onSurface }]}
          >
            {selectedDate ? formatNamedDate(selectedDate) : "—"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.labelRow}>
          <Icon source={icon} size={ICON_SIZES.md} color={iconColor} />

          <Text variant="labelLarge" style={[styles.labelText, { color: labelColor }]}>
            {label}
          </Text>
        </View>

        <Pressable onPress={handleOpen} disabled={disabled}>
          <View pointerEvents="none">
            <TextInput
              mode="outlined"
              value={selectedDate ? formatNamedDate(selectedDate) : ""}
              placeholder={`Select ${label}`}
              editable={!disabled}
              disabled={disabled}
              error={!!error}
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.colors.primary}
              style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
              outlineStyle={styles.inputOutline}
              right={<TextInput.Icon icon="calendar" />}
            />
          </View>
        </Pressable>

        <HelperText type="error" visible={!!error} padding="none">
          {error}
        </HelperText>
      </View>

      <DatePickerModal
        {...pickerProps}
        locale="en"
        mode="single"
        visible={visible}
        date={selectedDate}
        onDismiss={handleDismiss}
        onConfirm={handleConfirm}
      />
    </>
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
  viewValue: {
    fontWeight: "700",
  },
});
