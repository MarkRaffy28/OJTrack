import { Button, type ButtonProps } from "react-native-paper";
import type { AnyFormApi } from "@tanstack/react-form";

interface Props extends Omit<ButtonProps, "loading" | "disabled" | "onPress"> {
  form: AnyFormApi;
}

export function FormButton({ form, children, ...props }: Props) {
  const Subscribe = (form as any).Subscribe;

  return (
    <Subscribe
      selector={(state: any) =>
        [state.isValid, state.isDirty, state.isSubmitting] as const
      }
    >
      {([isValid, isDirty, isSubmitting]: [boolean, boolean, boolean]) => (
        <Button
          {...props}
          mode="contained"
          loading={isSubmitting}
          disabled={!isValid || !isDirty || isSubmitting}
          onPress={form.handleSubmit}
        >
          {children}
        </Button>
      )}
    </Subscribe>
  );
}
