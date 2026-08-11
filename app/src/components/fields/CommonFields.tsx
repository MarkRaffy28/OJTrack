import type { z } from "zod";

import { AppFormInstance } from "@/form/context";
import { CommonRegistrationRequestSchema } from "@/schemas/auth.schema";
import { getBirthDateRange } from "@/utils/date.util";

type CommonFormValues = z.infer<typeof CommonRegistrationRequestSchema>;

type Props<TFormData extends CommonFormValues> = {
  form: AppFormInstance<TFormData>;
};

export function CommonFields<TFormData extends CommonFormValues>({
  form,
}: Props<TFormData>) {
  return (
    <>
      <form.AppField name="userId">
        {(field) => <field.Field label="User ID" icon="key-outline" disabled />}
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

      <form.AppField name="username">
        {(field) => (
          <field.Field
            label="Username"
            autoCapitalize="none"
            maxLength={100}
            icon="account-outline"
          />
        )}
      </form.AppField>

      <form.AppField name="firstName">
        {(field) => (
          <field.Field
            label="First Name"
            autoCapitalize="words"
            maxLength={100}
            icon="account-outline"
          />
        )}
      </form.AppField>

      <form.AppField name="middleName">
        {(field) => (
          <field.Field
            label="Middle Name"
            autoCapitalize="words"
            maxLength={50}
            icon="account-outline"
          />
        )}
      </form.AppField>

      <form.AppField name="lastName">
        {(field) => (
          <field.Field
            label="Last Name"
            autoCapitalize="words"
            maxLength={50}
            icon="account-outline"
          />
        )}
      </form.AppField>

      <form.AppField name="extensionName">
        {(field) => (
          <field.Field
            label="Extension Name"
            autoCapitalize="characters"
            maxLength={10}
            icon="account-outline"
          />
        )}
      </form.AppField>

      <form.AppField name="birthDate">
        {(field) => (
          <field.DatePicker
            label="Birth Date"
            icon="calendar-outline"
            validRange={getBirthDateRange()}
          />
        )}
      </form.AppField>

      <form.AppField name="gender">
        {(field) => (
          <field.Select
            label="Gender"
            icon="gender-male-female"
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]}
          />
        )}
      </form.AppField>

      <form.AppField name="address">
        {(field) => (
          <field.Field
            label="Address"
            autoCapitalize="words"
            maxLength={255}
            icon="map-marker-outline"
          />
        )}
      </form.AppField>

      <form.AppField name="contactNumber">
        {(field) => (
          <field.Field
            label="Contact Number"
            autoCapitalize="none"
            autoComplete="tel"
            maxLength={15}
            icon="phone-outline"
            keyboardType="phone-pad"
          />
        )}
      </form.AppField>

      <form.AppField name="email">
        {(field) => (
          <field.Field
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            maxLength={100}
            icon="email-outline"
            keyboardType="email-address"
          />
        )}
      </form.AppField>
    </>
  );
}
