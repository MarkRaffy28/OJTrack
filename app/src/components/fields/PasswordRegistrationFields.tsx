import { AppFormInstance } from "@/form/hook";
import { PasswordRegistration } from "@/schemas/auth.schema";

type PasswordRegistrationFormValues = PasswordRegistration;

type Props<TFormData extends PasswordRegistrationFormValues> = {
  form: AppFormInstance<TFormData>;
};

export function PasswordRegistrationFields<
  TFormData extends PasswordRegistrationFormValues,
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
