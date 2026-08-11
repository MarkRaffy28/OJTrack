import { useState } from "react";
import { Pressable, View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import { DatePickerModal, DatePickerModalSingleProps } from "react-native-paper-dates";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

import { useFieldContext } from "@/form/context";
import { formatDateOnly, formatNamedDate } from "@/utils/date.util";

interface Props extends Omit<
  DatePickerModalSingleProps,
  "visible" | "date" | "onConfirm" | "onDismiss" | "mode" | "locale"
> {
  label: string;
  icon: IconSource;
}

export function FormDatePicker({ label, icon, ...pickerProps }: Props) {
  const field = useFieldContext();

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

    console.info(formatDateOnly(date!));
  };

  return (
    <>
      <Pressable onPress={() => setVisible(true)}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={selectedDate ? formatNamedDate(new Date(selectedDate)) : ""}
            editable={false}
            left={<TextInput.Icon icon={icon} />}
            right={<TextInput.Icon icon="calendar" />}
            error={!!error}
          />
        </View>
      </Pressable>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

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
