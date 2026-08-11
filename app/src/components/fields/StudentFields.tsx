import { z } from "zod";

import { AppFormInstance } from "@/form/context";
import { StudentRegistrationRequestSchema } from "@/schemas/auth.schema";

type StudentFormValues = z.input<typeof StudentRegistrationRequestSchema>;

type Props<TFormData extends StudentFormValues> = {
  form: AppFormInstance<TFormData>;
};

export function StudentFields<TFormData extends StudentFormValues>({
  form,
}: Props<TFormData>) {
  return (
    <>
      <form.AppField name="year">
        {(field) => (
          <field.Select
            label="Year"
            icon="numeric"
            options={[{ label: "4", value: "4" }]}
          />
        )}
      </form.AppField>

      <form.AppField name="program">
        {(field) => (
          <field.Select
            label="Program"
            icon="school-outline"
            options={[
              { label: "BS Information Technology", value: "BSIT" },
              { label: "BS Information System", value: "BSIS" },
            ]}
          />
        )}
      </form.AppField>

      <form.AppField name="major">
        {(field) => (
          <field.Select
            label="Major"
            icon="code-tags"
            options={[
              { label: "Web and Mobile Development", value: "WMD" },
              { label: "Cybersecurity and Networking", value: "CSN" },
            ]}
          />
        )}
      </form.AppField>

      <form.AppField name="section">
        {(field) => (
          <field.Field
            label="Section"
            autoCapitalize="characters"
            maxLength={10}
            icon="account-outline"
          />
        )}
      </form.AppField>
    </>
  );
}
