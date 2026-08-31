import { AppFormInstance } from "@/form/hook";
import { BaseUser } from "@/schemas/user.schema";
import { getBirthDateRange } from "@/utils/date.util";

type PersonalFormValues = Pick<BaseUser, "birthDate" | "gender">;

type PersonalFieldNames = keyof PersonalFormValues;

type Props<TFormData extends PersonalFormValues> = {
  form: AppFormInstance<TFormData>;
  fields?: PersonalFieldNames[];
  readOnlyFields?: PersonalFieldNames[];
  editable?: boolean;
};

export function PersonalFields<TFormData extends PersonalFormValues>({
  form,
  fields,
  readOnlyFields,
  editable = true,
}: Props<TFormData>) {
  const show = (name: PersonalFieldNames) =>
    fields === undefined || fields.includes(name);

  const isReadOnly = (name: PersonalFieldNames) =>
    readOnlyFields?.includes(name) || !editable;

  return (
    <>
      {show("birthDate") && (
        <form.AppField name="birthDate">
          {(field) => (
            <field.DatePicker
              mode={editable ? "edit" : "view"}
              label="Birth Date"
              icon="calendar-outline"
              validRange={getBirthDateRange()}
              disabled={isReadOnly("birthDate")}
            />
          )}
        </form.AppField>
      )}

      {show("gender") && (
        <form.AppField name="gender">
          {(field) => (
            <field.Select
              mode={editable ? "edit" : "view"}
              label="Gender"
              icon="gender-male-female"
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
              disabled={isReadOnly("gender")}
            />
          )}
        </form.AppField>
      )}
    </>
  );
}
