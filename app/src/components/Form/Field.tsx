import { useState } from "react";
import { HelperText, TextInput, TextInputProps } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

import { useFieldContext } from "@/form/context";

interface Props extends Omit<
  TextInputProps,
  "value" | "onChangeText" | "onBlur" | "error"
> {
  label: string;
  icon: IconSource;
  secure?: boolean;
}

export function FormField({ label, icon, secure, ...props }: Props) {
  const field = useFieldContext();

  if (!field) {
    throw new Error("useFieldContext must be used within a Form");
  }

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
        placeholder={props.placeholder ?? `Enter ${label}`}
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
