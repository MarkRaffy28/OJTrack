import { AppFormInstance } from "@/form/hook";
import { AttendanceHistoryItem } from "@/schemas/attendance.schema";

type AttendanceFormValues = AttendanceHistoryItem;

type AttendanceFieldNames = keyof AttendanceFormValues;

type Props<TFormData extends Partial<AttendanceFormValues>> = {
  form: AppFormInstance<TFormData>;
  fields?: AttendanceFieldNames[];
  readOnlyFields?: AttendanceFieldNames[];
  editable?: boolean;
};

const getAttendanceStatus = (timeValue: unknown, isVerified: boolean | undefined) => {
  if (!timeValue) return "notYetRecorded";
  return isVerified ? "verified" : "pending";
};

export function AttendanceFields<TFormData extends Partial<AttendanceFormValues>>({
  form,
  fields,
  readOnlyFields,
  editable = true,
}: Props<TFormData>) {
  const show = (name: AttendanceFieldNames) =>
    fields === undefined || fields.includes(name);

  const isReadOnly = (name: AttendanceFieldNames) =>
    readOnlyFields?.includes(name) || !editable;

  return (
    <>
      {show("date") && (
        <form.AppField name="date">
          {(field) => (
            <field.DatePicker
              mode={editable ? "edit" : "view"}
              label="Date"
              icon="calendar-outline"
              disabled={isReadOnly("date")}
            />
          )}
        </form.AppField>
      )}

      {show("totalHours") && (
        <form.AppField name="totalHours">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Total Hours"
              icon="clock-outline"
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
              attendanceStatus={getAttendanceStatus(
                field.state.value,
                form.state.values.morningInVerified,
              )}
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
              attendanceStatus={getAttendanceStatus(
                field.state.value,
                form.state.values.morningOutVerified,
              )}
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
              attendanceStatus={getAttendanceStatus(
                field.state.value,
                form.state.values.afternoonInVerified,
              )}
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
              attendanceStatus={getAttendanceStatus(
                field.state.value,
                form.state.values.afternoonOutVerified,
              )}
            />
          )}
        </form.AppField>
      )}
    </>
  );
}
