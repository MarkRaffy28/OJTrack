import { useRef } from "react";
import { StyleSheet, View, TextInput as RNTextInput } from "react-native";
import { HelperText, Text } from "react-native-paper";

import { useFieldContext } from "@/form/context";
import { useTheme } from "@/store/settings.store";

interface Props {
  mode?: "view" | "edit";
  onComplete?: () => void;
}

export function FormOTPField({ mode = "edit", onComplete }: Props) {
  const field = useFieldContext();
  const theme = useTheme();
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  if (!field) {
    throw new Error("useFieldContext must be used within a Form");
  }

  const {
    value = "",
    meta: { errors, isTouched },
  } = field.state;

  const error = isTouched && errors.length > 0 ? String(errors[0]?.message) : undefined;

  const digits = String(value).split("").slice(0, 6);
  while (digits.length < 6) digits.push("");

  const handleDigitChange = (index: number, text: string) => {
    const digit = text.replace(/[^0-9]/g, "");

    if (digit.length > 1) {
      const pastedDigits = digit.slice(0, 6 - index);
      const newValue = digits.slice(0, index).join("") + pastedDigits;
      field.handleChange(newValue);

      const nextIndex = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (newValue.length === 6) {
        onComplete?.();
      }
    } else if (digit) {
      const newValue =
        digits.slice(0, index).join("") + digit + digits.slice(index + 1).join("");

      field.handleChange(newValue);

      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      if (newValue.length === 6) {
        onComplete?.();
      }
    } else if (text === "") {
      const newValue = digits.slice(0, index).join("") + digits.slice(index + 1).join("");
      field.handleChange(newValue);
    }
  };

  const handleKeyPress = (index: number, event: any) => {
    if (event.nativeEvent.key === "Backspace" && !digits[index]) {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  if (mode === "view") {
    return (
      <View style={styles.viewContainer}>
        <Text
          variant="titleMedium"
          style={[styles.viewValue, { color: theme.colors.onSurface }]}
        >
          {String(value ?? "")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.otpGrid}>
        {digits.map((digit, index) => (
          <RNTextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleDigitChange(index, text)}
            onKeyPress={(event) => handleKeyPress(index, event)}
            onBlur={field.handleBlur}
            maxLength={1}
            keyboardType="numeric"
            textAlign="center"
            textAlignVertical="center"
            style={[
              styles.otpInput,
              {
                color: theme.colors.primary,
                borderBottomColor: error ? theme.colors.error : theme.colors.primary,
                outlineStyle: "none" as any,
              },
            ]}
          />
        ))}
      </View>

      <HelperText type="error" visible={!!error} padding="none">
        {error}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  otpGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: "800",
    width: 44,
    height: 48,
    textAlign: "center",
    textAlignVertical: "center",
    borderBottomWidth: 2,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  viewContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  viewValue: {
    fontWeight: "700",
  },
});
