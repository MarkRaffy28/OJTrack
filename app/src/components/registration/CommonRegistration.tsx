import { router } from "expo-router";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { CommonFields } from "@/components/fields/CommonFields";
import { useAppForm } from "@/form/context";
import { CommonRegistrationRequestSchema } from "@/schemas/auth.schema";
import { useAuthUser, useUpdateUser } from "@/store/auth.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { registrationValidator } from "@/validators/auth.validator";

type FormValues = z.infer<typeof CommonRegistrationRequestSchema>;

export function CommonRegistration() {
  const user = useAuthUser();
  const updateUser = useUpdateUser();

  const mutation = useMutation({
    mutationFn: api.registerSupervisor,
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
    } as FormValues,
    validators: {
      onMount: registrationValidator(CommonRegistrationRequestSchema),
      onChange: registrationValidator(CommonRegistrationRequestSchema),
      onSubmit: registrationValidator(CommonRegistrationRequestSchema),
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = CommonRegistrationRequestSchema.parse(value);

        await mutation.mutateAsync(payload);
      } catch (error) {
        form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
      }
    },
  });

  return (
    <form.AppForm>
      <CommonFields form={form} />

      <form.ErrorMessage />

      <form.Submit>Complete Registration</form.Submit>
    </form.AppForm>
  );
}
