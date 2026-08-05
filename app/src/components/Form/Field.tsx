import { useState } from "react";
import { HelperText, TextInput, TextInputProps } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import { AnyFieldApi } from "@tanstack/react-form";

interface Props extends Omit<
  TextInputProps,
  "value" | "onChangeText" | "onBlur" | "error"
> {
  field: AnyFieldApi;
  label: string;
  icon: IconSource;
  secure?: boolean;
}

export function FormField({ field, label, icon, secure, ...props }: Props) {
  const {
    value,
    meta: { errors, isTouched },
  } = field.state;

  const [secureTextEntry, setSecureTextEntry] = useState(secure);

  const error = isTouched && errors.length > 0 ? String(errors[0]?.message) : undefined;

  return (
    <>
      <TextInput
        {...props}
        mode="outlined"
        label={label}
        value={String(value ?? "")}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        error={!!error}
        secureTextEntry={secureTextEntry}
        left={<TextInput.Icon icon={icon} />}
        right={
          secure && (
            <TextInput.Icon
              icon={secureTextEntry ? "eye" : "eye-off"}
              onPress={() => setSecureTextEntry((prev) => !prev)}
            />
          )
        }
      />

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </>
  );
}
