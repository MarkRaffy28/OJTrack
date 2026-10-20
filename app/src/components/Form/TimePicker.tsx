import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { HelperText, Icon, Text, TextInput } from "react-native-paper";
import { TimePickerModal } from "react-native-paper-dates";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

import { Chip } from "@/components/ui/Chip";
import { ICON_SIZES } from "@/constants/icons.constants";
import { useFieldContext } from "@/form/context";
import { useTheme } from "@/store/settings.store";
import { formatTimeOnly, formatNamedTime } from "@/utils/time.util";
import { capitalize } from "@/utils/string.util";

interface Props {
  label: string;
  icon: IconSource;
  attendanceStatus?: "notYetRecorded" | "pending" | "verified";
  disabled?: boolean;
  mode?: "view" | "edit";
}

const ATTENDANCE_STATUS_TONE_MAP = {
  notYetRecorded: "warning",
  pending: "info",
  verified: "success",
} as const;

export function FormTimePicker({
  label,
  icon,
  attendanceStatus,
  disabled = false,
  mode = "edit",
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

  // Parse time string (HH:mm) to hours and minutes for the picker
  const { hours, minutes } = parseTimeString(value);

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

  const handleConfirm = ({
    hours: h,
    minutes: m,
  }: {
    hours: number;
    minutes: number;
  }) => {
    setVisible(false);
    field.handleChange(formatTimeOnly(h, m));
    field.handleBlur();
    field.validate("blur");
  };

  const displayTime = value ? formatNamedTime(value) : "—";

  if (mode === "view") {
    const statusTone = attendanceStatus
      ? ATTENDANCE_STATUS_TONE_MAP[attendanceStatus]
      : undefined;

    return (
      <View style={[styles.viewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={[styles.viewIconBadge, { backgroundColor: theme.colors.surface }]}>
          <Icon source={icon} size={ICON_SIZES.lg} color={theme.colors.primary} />
        </View>

        <View style={styles.viewTextColumn}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>

          <View style={styles.viewFooter}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {displayTime}
            </Text>

            {statusTone && (
              <Chip
                text={capitalize(attendanceStatus?.replace("notYetRecorded", "not yet recorded") || "")}
                tone={statusTone as "neutral" | "success" | "warning" | "info" | "error"}
                size="small"
                variant="filled"
                style={{ marginLeft: "auto" }}
              />
            )}
          </View>
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
              value={displayTime}
              placeholder={`Select ${label}`}
              editable={!disabled}
              disabled={disabled}
              error={!!error}
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.colors.primary}
              style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
              outlineStyle={styles.inputOutline}
              right={<TextInput.Icon icon="clock" />}
            />
          </View>
        </Pressable>

        <HelperText type="error" visible={!!error} padding="none">
          {error}
        </HelperText>
      </View>

      <TimePickerModal
        locale="en"
        visible={visible}
        hours={hours}
        minutes={minutes}
        onConfirm={handleConfirm}
        onDismiss={handleDismiss}
      />
    </>
  );
}

/**
 * Parse time string (HH:mm) into hours and minutes.
 * Returns { hours: 0, minutes: 0 } if value is invalid or undefined.
 */
function parseTimeString(value: unknown): { hours: number; minutes: number } {
  if (typeof value !== "string" || !value) {
    return { hours: 0, minutes: 0 };
  }

  const parts = value.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return { hours: 0, minutes: 0 };
  }

  return { hours, minutes };
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
    gap: 4,
  },
  viewFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
