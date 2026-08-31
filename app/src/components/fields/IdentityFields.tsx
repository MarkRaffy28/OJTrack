import { AppFormInstance } from "@/form/hook";
import { BaseUser } from "@/schemas/user.schema";
import { useAuthUser } from "@/store/auth.store";

type IdentityFormValues = Pick<
  BaseUser,
  | "userId"
  | "username"
  | "firstName"
  | "middleName"
  | "lastName"
  | "extensionName"
  | "fullName"
>;

type IdentityFieldNames = keyof IdentityFormValues;

type Props<TFormData extends Partial<IdentityFormValues>> = {
  form: AppFormInstance<TFormData>;
  fields?: IdentityFieldNames[];
  readOnlyFields?: Exclude<IdentityFieldNames, "fullName">[];
  editable?: boolean;
};

export function IdentityFields<TFormData extends Partial<IdentityFormValues>>({
  form,
  fields,
  readOnlyFields,
  editable = true,
}: Props<TFormData>) {
  const user = useAuthUser();
  const isStudent = user?.role === "student";

  const show = (name: IdentityFieldNames) =>
    fields === undefined || fields.includes(name);

  const isReadOnly = (name: Exclude<IdentityFieldNames, "fullName">) =>
    readOnlyFields?.includes(name) || !editable;

  return (
    <>
      {show("userId") && (
        <form.AppField name="userId">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label={isStudent ? "Student ID" : "User ID"}
              icon="key-outline"
              editable={!isReadOnly("userId")}
            />
          )}
        </form.AppField>
      )}

      {show("username") && (
        <form.AppField name="username">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Username"
              autoCapitalize="none"
              maxLength={100}
              icon="account-outline"
              editable={!isReadOnly("username")}
            />
          )}
        </form.AppField>
      )}

      {show("firstName") && (
        <form.AppField name="firstName">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="First Name"
              autoCapitalize="words"
              maxLength={100}
              icon="account-outline"
              editable={!isReadOnly("firstName")}
            />
          )}
        </form.AppField>
      )}

      {show("middleName") && (
        <form.AppField name="middleName">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Middle Name"
              autoCapitalize="words"
              maxLength={50}
              icon="account-outline"
              editable={!isReadOnly("middleName")}
            />
          )}
        </form.AppField>
      )}

      {show("lastName") && (
        <form.AppField name="lastName">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Last Name"
              autoCapitalize="words"
              maxLength={50}
              icon="account-outline"
              editable={!isReadOnly("lastName")}
            />
          )}
        </form.AppField>
      )}

      {show("extensionName") && (
        <form.AppField name="extensionName">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Extension Name"
              autoCapitalize="characters"
              maxLength={10}
              icon="account-outline"
              editable={!isReadOnly("extensionName")}
            />
          )}
        </form.AppField>
      )}

      {show("fullName") && (
        <form.AppField name="fullName">
          {(field) => (
            <field.Field
              mode={editable ? "edit" : "view"}
              label="Full Name"
              maxLength={100}
              icon="account-outline"
              editable={false}
            />
          )}
        </form.AppField>
      )}
    </>
  );
}
