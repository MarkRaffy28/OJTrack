import { AppFormInstance } from "@/form/hook";
import { ChangePasswordRequest } from "@/schemas/auth.schema";

type ChangePasswordFormValues = ChangePasswordRequest;

type Props<TFormData extends ChangePasswordFormValues> = {
  form: AppFormInstance<TFormData>;
};

export function ChangePasswordFields<
  TFormData extends ChangePasswordFormValues,
>({ form }: Props<TFormData>) {
  return (
    <>
      <form.AppField name="currentPassword">
        {(field) => (
          <field.Field
            label="Current Password"
            autoCapitalize="none"
            autoComplete="password"
            icon="lock-outline"
            secure
          />
        )}
      </form.AppField>

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
