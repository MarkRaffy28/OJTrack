import { AppFormInstance } from "@/form/hook";
import { EmergencyContact } from "@/schemas/user.schema";

type EmergencyContactFormValues = Pick<
  EmergencyContact,
  "name" | "relationship" | "contactNumber" | "address"
>;

type EmergencyContactFieldNames = keyof EmergencyContactFormValues;

type Props<TFormData extends { emergencyContact?: EmergencyContactFormValues }> = {
  form: AppFormInstance<TFormData>;
  fields?: EmergencyContactFieldNames[];
  readOnlyFields?: EmergencyContactFieldNames[];
};

export function EmergencyContactFields<
  TFormData extends { emergencyContact?: EmergencyContactFormValues },
>({ form, fields, readOnlyFields }: Props<TFormData>) {
  const show = (name: EmergencyContactFieldNames) =>
    fields === undefined || fields.includes(name);

  const isReadOnly = (name: EmergencyContactFieldNames) =>
    readOnlyFields?.includes(name) ?? false;

  return (
    <>
      {show("name") && (
        <form.AppField name="emergencyContact.name">
          {(field) => (
            <field.Field
              label="Full Name"
              placeholder="Enter emergency contact's full name"
              autoCapitalize="words"
              maxLength={210}
              icon="account-outline"
              editable={!isReadOnly("name")}
            />
          )}
        </form.AppField>
      )}

      {show("relationship") && (
        <form.AppField name="emergencyContact.relationship">
          {(field) => (
            <field.Field
              label="Relationship"
              placeholder="e.g. Mother, Father, Guardian"
              autoCapitalize="words"
              maxLength={50}
              icon="account-group-outline"
              editable={!isReadOnly("relationship")}
            />
          )}
        </form.AppField>
      )}

      {show("contactNumber") && (
        <form.AppField name="emergencyContact.contactNumber">
          {(field) => (
            <field.Field
              label="Contact Number"
              placeholder="Enter emergency contact's number"
              autoCapitalize="none"
              autoComplete="tel"
              maxLength={11}
              icon="phone-outline"
              keyboardType="phone-pad"
              editable={!isReadOnly("contactNumber")}
            />
          )}
        </form.AppField>
      )}

      {show("address") && (
        <form.AppField name="emergencyContact.address">
          {(field) => (
            <field.Field
              label="Contact Address"
              placeholder="Enter emergency contact's address"
              autoCapitalize="words"
              maxLength={255}
              icon="map-marker-outline"
              editable={!isReadOnly("address")}
            />
          )}
        </form.AppField>
      )}
    </>
  );
}
