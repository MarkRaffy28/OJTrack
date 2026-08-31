import { useState } from "react";
import { ScrollView } from "react-native";
import { router } from "expo-router";
import { Appbar, Tooltip } from "react-native-paper";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { ContactFields } from "@/components/fields/ContactFields";
import { IdentityFields } from "@/components/fields/IdentityFields";
import { PersonalFields } from "@/components/fields/PersonalFields";
import { AppView } from "@/components/ui/AppView";
import { SafeView } from "@/components/ui/SafeView";

import { useAppForm } from "@/form/hook";
import { UpdatePersonalInformationRequestSchema } from "@/schemas/user.schema";
import { useAuthUser, useUpdateUser } from "@/store/auth.store";
import { useShowSnackbar } from "@/store/snackbar.store";
import { getApiErrorMessage } from "@/utils/api.util";

export default function PersonalInformationScreen() {
  const showSnackbar = useShowSnackbar();

  const user = useAuthUser();
  const updateUser = useUpdateUser();

  const [isEditing, setIsEditing] = useState(false);

  const defaultValues = {
    username: user?.username ?? "",
    firstName: user?.firstName ?? "",
    middleName: user?.middleName ?? null,
    lastName: user?.lastName ?? "",
    extensionName: user?.extensionName ?? null,
    birthDate: user?.birthDate ?? "",
    gender: user?.gender ?? "Male",
    homeAddress: user?.homeAddress ?? "",
    presentAddress: user?.presentAddress ?? "",
    contactNumber: user?.contactNumber ?? "",
    email: user?.email ?? "",
  };

  const mutation = useMutation({
    mutationFn: api.updatePersonalInformation,
    onSuccess: async ({ user }) => {
      updateUser(user);

      setIsEditing(false);
      showSnackbar("Personal Information updated successfully.");
    },
  });

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: UpdatePersonalInformationRequestSchema,
      onChange: UpdatePersonalInformationRequestSchema,
      onSubmit: UpdatePersonalInformationRequestSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
      }
    },
  });

  const handleSubmit = () => {
    if (JSON.stringify(form.state.values) === JSON.stringify(defaultValues)) {
      setIsEditing(false);
      showSnackbar("No changes to save.");

      return;
    }

    form.handleSubmit();
  };

  return (
    <SafeView>
      <form.AppForm>
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Personal Information" />

          {isEditing ? (
            <Tooltip title="Save Changes">
              <Appbar.Action
                icon="check"
                onPress={handleSubmit}
                disabled={mutation.isPending}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Edit">
              <Appbar.Action icon="pencil" onPress={() => setIsEditing(true)} />
            </Tooltip>
          )}
        </Appbar.Header>

        <ScrollView>
          <AppView>
            <IdentityFields
              form={form}
              editable={isEditing}
              fields={[
                "username",
                "firstName",
                "middleName",
                "lastName",
                "extensionName",
              ]}
            />

            <PersonalFields form={form} editable={isEditing} />
            <ContactFields form={form} editable={isEditing} />

            <form.ErrorMessage />
          </AppView>
        </ScrollView>
      </form.AppForm>
    </SafeView>
  );
}
