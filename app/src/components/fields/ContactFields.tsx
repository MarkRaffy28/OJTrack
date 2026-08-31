import { AppFormInstance } from "@/form/hook";
import { BaseUser } from "@/schemas/user.schema";

type ContactFormValues = Pick<
  BaseUser,
  "homeAddress" | "presentAddress" | "contactNumber" | "email"
>;

type ContactFieldNames = keyof ContactFormValues;

type Props<TFormData extends ContactFormValues> = {
  form: AppFormInstance<TFormData>;
  fields?: ContactFieldNames[];
  readOnlyFields?: ContactFieldNames[];
  editable?: boolean;
};

export function ContactFields<TFormData extends ContactFormValues>({
  form,
  fields,
  readOnlyFields,
  editable = true,
}: Props<TFormData>) {
  const show = (name: ContactFieldNames) => fields === undefined || fields.includes(name);

  const isReadOnly = (name: ContactFieldNames) => readOnlyFields?.includes(name) || !editable;

  return (
    <>
      {show("homeAddress") && (
        <form.AppField name="homeAddress">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Home Address"
              autoCapitalize="words"
              maxLength={255}
              icon="home-outline"
              editable={!isReadOnly("homeAddress")}
            />
          )}
        </form.AppField>
      )}

      {show("presentAddress") && (
        <form.AppField name="presentAddress">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Present Address"
              autoCapitalize="words"
              maxLength={255}
              icon="map-marker-outline"
              editable={!isReadOnly("presentAddress")}
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

      {show("email") && (
        <form.AppField name="email">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              maxLength={100}
              icon="email-outline"
              keyboardType="email-address"
              editable={!isReadOnly("email")}
            />
          )}
        </form.AppField>
      )}
    </>
  );
}
