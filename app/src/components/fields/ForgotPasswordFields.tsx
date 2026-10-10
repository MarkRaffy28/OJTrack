import { AppFormInstance } from "@/form/hook";
import { ResetPasswordRequest } from "@/schemas/auth.schema";

type ForgotPasswordFormValues = ResetPasswordRequest;

type Props<TFormData extends ForgotPasswordFormValues> = {
  form: AppFormInstance<TFormData>;
};

export function ForgotPasswordFields<
  TFormData extends ForgotPasswordFormValues,
>({ form }: Props<TFormData>) {
  return (
    <>
      <form.AppField name="newPassword">
        {(field) => (
          <field.Field
            label="New Password"
            autoCapitalize="none"
            autoComplete="password"
            icon="lock-outline"
            secure
          />
        )}
      </form.AppField>

      <form.AppField name="confirmPassword">
        {(field) => (
          <field.Field
            label="Confirm Password"
            autoCapitalize="none"
            autoComplete="password"
            icon="lock-outline"
            secure
          />
        )}
      </form.AppField>
    </>
  );
}
