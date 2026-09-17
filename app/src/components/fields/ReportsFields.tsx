import { AppFormInstance } from "@/form/hook";
import {
  ReportStatusSchema,
  ReportTypeSchema,
  UpdateReportForm,
} from "@/schemas/report.schema";
import { getPastDateRange } from "@/utils/date.util";
import { capitalize } from "@/utils/string.util";

type ReportFormValues = UpdateReportForm;

type ReportFieldNames = keyof ReportFormValues;

type Props<TFormData extends Partial<ReportFormValues> = ReportFormValues> = {
  form: AppFormInstance<TFormData>;
  fields?: ReportFieldNames[];
  readOnlyFields?: string[];
  editable?: boolean;
};

export function ReportFields<
  TFormData extends Partial<ReportFormValues> = ReportFormValues,
>({ form, fields, readOnlyFields, editable = true }: Props<TFormData>) {
  const show = (name: ReportFieldNames) => fields === undefined || fields.includes(name);

  const isReadOnly = (name: string) => readOnlyFields?.includes(name) || !editable;

  return (
    <>
      {show("type") && (
        <form.AppField name="type">
          {(field) => (
            <field.Select
              mode={editable ? "edit" : "view"}
              label="Type"
              icon="file-document-multiple-outline"
              options={ReportTypeSchema.options.map((type) => ({
                label: capitalize(type),
                value: type,
              }))}
              disabled={isReadOnly("type")}
            />
          )}
        </form.AppField>
      )}

      {show("reportDate") && (
        <form.AppField name="reportDate">
          {(field) => (
            <field.DatePicker
              mode={editable ? "edit" : "view"}
              label="Date"
              icon="calendar-outline"
              validRange={getPastDateRange()}
              disabled={isReadOnly("reportDate")}
            />
          )}
        </form.AppField>
      )}

      {show("documents") && (
        <form.AppField name="documents">
          {(field) => (
            <field.FileField
              mode={editable ? "edit" : "view"}
              label="Documents"
              icon="file-outline"
              accept="application/pdf"
              maxFiles={3}
              disabled={isReadOnly("documents")}
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
              options={ReportStatusSchema.options.map((status) => ({
                label: capitalize(status),
                value: status,
              }))}
              disabled={isReadOnly("status")}
            />
          )}
        </form.AppField>
      )}

      {show("reviewedBy") && (
        <form.AppField name="reviewedBy">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Reviewed By"
              icon="account-check-outline"
              editable={!isReadOnly("reviewedBy")}
            />
          )}
        </form.AppField>
      )}

      {show("reviewedAt") && (
        <form.AppField name="reviewedAt">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Reviewed At"
              icon="clock-check-outline"
              editable={!isReadOnly("reviewedAt")}
            />
          )}
        </form.AppField>
      )}

      {show("feedback") && (
        <form.AppField name="feedback">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Feedback"
              autoCapitalize="sentences"
              maxLength={1000}
              icon="comment-text-outline"
              editable={!isReadOnly("feedback")}
            />
          )}
        </form.AppField>
      )}
    </>
  );
}
