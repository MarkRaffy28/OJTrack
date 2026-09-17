import { AppFormInstance } from "@/form/hook";
import { OJT } from "@/schemas/ojt.schema";
import { getAcademicYearOptions, getBirthDateRange } from "@/utils/date.util";

type OJTDetailFormValues = Pick<
  OJT,
  | "academicYear"
  | "term"
  | "requiredHours"
  | "renderedHours"
  | "status"
  | "startDate"
  | "endDate"
>;

type OJTDetailFieldNames = keyof OJTDetailFormValues;

type Props<TFormData extends OJTDetailFormValues> = {
  form: AppFormInstance<TFormData>;
  fields?: OJTDetailFieldNames[];
  readOnlyFields?: OJTDetailFieldNames[];
  editable?: boolean;
};

export function OJTDetailFields<TFormData extends OJTDetailFormValues>({
  form,
  fields,
  readOnlyFields,
  editable = true,
}: Props<TFormData>) {
  const show = (name: OJTDetailFieldNames) =>
    fields === undefined || fields.includes(name);

  const isReadOnly = (name: OJTDetailFieldNames) =>
    readOnlyFields?.includes(name) || !editable;

  return (
    <>
      {show("academicYear") && (
        <form.AppField name="academicYear">
          {(field) => (
            <field.Select
              mode={editable ? "edit" : "view"}
              label="Academic Year"
              icon="calendar-range-outline"
              options={getAcademicYearOptions()}
              disabled={isReadOnly("academicYear")}
            />
          )}
        </form.AppField>
      )}

      {show("term") && (
        <form.AppField name="term">
          {(field) => (
            <field.Select
              mode={editable ? "edit" : "view"}
              label="Term"
              icon="calendar-outline"
              options={[
                { label: "First", value: "1st" },
                { label: "Second", value: "2nd" },
                { label: "Summer", value: "Summer" },
              ]}
              disabled={isReadOnly("term")}
            />
          )}
        </form.AppField>
      )}

      {show("requiredHours") && (
        <form.AppField name="requiredHours">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Required Hours"
              icon="clock-check-outline"
              editable={!isReadOnly("requiredHours")}
            />
          )}
        </form.AppField>
      )}

      {show("renderedHours") && (
        <form.AppField name="renderedHours">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Rendered Hours"
              icon="history"
              editable={!isReadOnly("renderedHours")}
            />
          )}
        </form.AppField>
      )}

      {show("status") && (
        <form.AppField name="status">
          {(field) => (
            <field.Select
              mode={editable ? "edit" : "view"}
              label="Status"
              icon="information-outline"
              options={[
                { label: "Pending", value: "pending" },
                { label: "Ongoing", value: "ongoing" },
                { label: "Completed", value: "completed" },
                { label: "Dropped", value: "dropped" },
              ]}
              disabled={isReadOnly("status")}
            />
          )}
        </form.AppField>
      )}

      {show("startDate") && (
        <form.AppField name="startDate">
          {(field) => (
            <field.DatePicker
              mode={editable ? "edit" : "view"}
              label="Start Date"
              icon="calendar-start-outline"
              validRange={getBirthDateRange()}
              disabled={isReadOnly("startDate")}
            />
          )}
        </form.AppField>
      )}

      {show("endDate") && (
        <form.AppField name="endDate">
          {(field) => (
            <field.DatePicker
              mode={editable ? "edit" : "view"}
              label="End Date"
              icon="calendar-end-outline"
              validRange={getBirthDateRange()}
              disabled={isReadOnly("endDate")}
            />
          )}
        </form.AppField>
      )}
    </>
  );
}
