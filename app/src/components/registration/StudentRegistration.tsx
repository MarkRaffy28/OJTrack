import { router } from "expo-router";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { CommonFields } from "@/components/fields/CommonFields";
import { StudentFields } from "@/components/fields/StudentFields";
import { useAppForm } from "@/form/context";
import { StudentRegistrationRequestSchema } from "@/schemas/auth.schema";
import { useAuthUser, useUpdateUser } from "@/store/auth.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { registrationValidator } from "@/validators/auth.validator";

type FormValues = z.input<typeof StudentRegistrationRequestSchema>;

export function StudentRegistration() {
  const user = useAuthUser();
  const updateUser = useUpdateUser();

  const mutation = useMutation({
    mutationFn: api.registerStudent,
    onSuccess: async (data) => {
      updateUser(data.user);

      router.push("/");
    },
  });

  const form = useAppForm({
    defaultValues: {
      userId: user?.user_id,

      newPassword: "",
      confirmPassword: "",

      username: "",
      firstName: "",
      middleName: undefined,
      lastName: "",
      extensionName: undefined,

      birthDate: "",
      gender: undefined,

      address: "",
      contactNumber: "",
      email: "",

      year: "4",
      program: "",
      major: "",
      section: "",
    } as FormValues,
    validators: {
      onMount: registrationValidator(StudentRegistrationRequestSchema),
      onChange: registrationValidator(StudentRegistrationRequestSchema),
      onSubmit: registrationValidator(StudentRegistrationRequestSchema),
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = StudentRegistrationRequestSchema.parse(value);

        await mutation.mutateAsync(payload);
      } catch (error) {
        form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
      }
    },
  });

  return (
    <form.AppForm>
      <CommonFields form={form} />
      <StudentFields form={form} />

      <form.ErrorMessage />

      <form.Submit>Complete Registration</form.Submit>
    </form.AppForm>
  );
}
