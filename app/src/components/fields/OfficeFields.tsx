import { AppFormInstance } from "@/form/hook";
import { Office } from "@/schemas/office.schema";
import { getAcademicYearOptions, getBirthDateRange } from "@/utils/date.util";

type OfficeFormValues = Office;

type OfficeFieldNames = keyof OfficeFormValues;

type Props<TFormData extends OfficeFormValues> = {
  form: AppFormInstance<TFormData>;
  fields?: OfficeFieldNames[];
  readOnlyFields?: OfficeFieldNames[];
  editable?: boolean;
};

export function OfficeFields<TFormData extends OfficeFormValues>({
  form,
  fields,
  readOnlyFields,
  editable = true,
}: Props<TFormData>) {
  const show = (name: OfficeFieldNames) =>
    fields === undefined || fields.includes(name);

  const isReadOnly = (name: OfficeFieldNames) =>
    readOnlyFields?.includes(name) || !editable;

  return (
    <>
      {show("name") && (
        <form.AppField name="name">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Name"
              icon="domain"
              disabled={isReadOnly("name")}
            />
          )}
        </form.AppField>
      )}

      {show("address") && (
        <form.AppField name="address">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Address"
              icon="map-marker-outline"
              disabled={isReadOnly("address")}
            />
          )}
        </form.AppField>
      )}

      {show("contactEmail") && (
        <form.AppField name="contactEmail">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Contact Email"
              icon="email-outline"
              disabled={isReadOnly("contactEmail")}
            />
          )}
        </form.AppField>
      )}

      {show("contactPhone") && (
        <form.AppField name="contactPhone">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Contact Phone"
              icon="phone-outline"
              disabled={isReadOnly("contactPhone")}
            />
          )}
        </form.AppField>
      )}

      {show("morningIn") && (
        <form.AppField name="morningIn">
          {(field) => (
            <field.TimePicker
              mode={editable ? "edit" : "view"}
              label="Morning In"
              icon="weather-sunny"
              disabled={isReadOnly("morningIn")}
            />
          )}
        </form.AppField>
      )}

      {show("morningOut") && (
        <form.AppField name="morningOut">
          {(field) => (
            <field.TimePicker
              mode={editable ? "edit" : "view"}
              label="Morning Out"
              icon="weather-sunny-off"
              disabled={isReadOnly("morningOut")}
            />
          )}
        </form.AppField>
      )}

      {show("afternoonIn") && (
        <form.AppField name="afternoonIn">
          {(field) => (
            <field.TimePicker
              mode={editable ? "edit" : "view"}
              label="Afternoon In"
              icon="weather-sunny"
              disabled={isReadOnly("afternoonIn")}
            />
          )}
        </form.AppField>
      )}

      {show("afternoonOut") && (
        <form.AppField name="afternoonOut">
          {(field) => (
            <field.TimePicker
              mode={editable ? "edit" : "view"}
              label="Afternoon Out"
              icon="weather-sunny-off"
              disabled={isReadOnly("afternoonOut")}
            />
          )}
        </form.AppField>
      )}
    </>
  );
}
