import { AppFormInstance } from "@/form/hook";

type Props<TFormData extends Record<string, any>> = {
  form: AppFormInstance<TFormData>;
  editable?: boolean;
};

export function StudentFields<TFormData extends Record<string, any>>({
  form,
  editable = true,
}: Props<TFormData>) {
  return (
    <>
      <form.AppField name="year">
        {(field) => (
          <field.Select
            mode={editable ? "edit" : "view"}
            label="Year"
            icon="numeric"
            options={[{ label: "4", value: 4 }]}
          />
        )}
      </form.AppField>

      <form.AppField name="program">
        {(field) => (
          <field.Select
            mode={editable ? "edit" : "view"}
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
            mode={editable ? "edit" : "view"}
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
            mode={editable ? "edit" : "view"}
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
