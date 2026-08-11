import { Button, type ButtonProps } from "react-native-paper";

import { useFormContext } from "@/form/context";

interface Props extends Omit<ButtonProps, "loading" | "disabled" | "onPress"> {}

export function FormSubmit({ children, ...props }: Props) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => {
        const hasFieldErrors = Object.values(state.fieldMeta).some(
          (field: any) => field.errors.length > 0,
        );

        const { onSubmit, ...rest } = state.errorMap;
        const hasFormError = Object.values(rest).some(Boolean);

        return [hasFieldErrors || hasFormError, state.isSubmitting] as const;
      }}
    >
      {([hasFieldErrors, isSubmitting]) => (
        <Button
          {...props}
          mode="contained"
          loading={isSubmitting}
          disabled={hasFieldErrors || isSubmitting}
          onPress={form.handleSubmit}
        >
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}
