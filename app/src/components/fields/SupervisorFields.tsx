import { AppFormInstance } from "@/form/hook";

type SupervisorFieldsNames = "fullName" | "email" | "contactNumber" | "position";

type Props<TFormData extends Record<string, any>> = {
  form: AppFormInstance<TFormData>;
  fields?: SupervisorFieldsNames[];
  editable?: boolean;
};

export function SupervisorFields<TFormData extends Record<string, any>>({
  form,
  fields,
  editable = true,
}: Props<TFormData>) {
  const show = (name: SupervisorFieldsNames) =>
    fields === undefined || fields.includes(name);

  return (
    <>
      {show("fullName") && (
        <form.AppField name="fullName">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Supervisor Name"
              icon="account-tie-outline"
              editable={editable}
            />
          )}
        </form.AppField>
      )}

      {show("position") && (
        <form.AppField name="position">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Position / Role"
              icon="briefcase-outline"
              editable={editable}
            />
          )}
        </form.AppField>
      )}

      {show("email") && (
        <form.AppField name="email">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Email Address"
              keyboardType="email-address"
              icon="email-outline"
              editable={editable}
            />
          )}
        </form.AppField>
      )}

      {show("contactNumber") && (
        <form.AppField name="contactNumber">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Contact Number"
              keyboardType="phone-pad"
              icon="phone-outline"
              editable={editable}
            />
          )}
        </form.AppField>
      )}
    </>
  );
}
