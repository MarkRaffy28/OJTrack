import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { router } from "expo-router";
import { Appbar, Tooltip } from "react-native-paper";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { AppView } from "@/components/ui/AppView";
import { EmergencyContactFields } from "@/components/fields/EmergencyContactFields";
import { SafeView } from "@/components/ui/SafeView";
import { useAppForm } from "@/form/hook";
import { useRefreshUser } from "@/hooks/useRefreshUser";
import { UpdateEmergencyContactRequestSchema } from "@/schemas/user.schema";
import { useAuthUser, useUpdateUser } from "@/store/auth.store";
import { useShowSnackbar } from "@/store/snackbar.store";
import { getApiErrorMessage } from "@/utils/api.util";

export default function EmergencyContactScreen() {
  const showSnackbar = useShowSnackbar();

  const user = useAuthUser();
  const updateUser = useUpdateUser();

  const { refreshing, refreshUser } = useRefreshUser();

  const [isEditing, setIsEditing] = useState(false);

  const isStudent = user?.role === "student";

  const primaryContacts = isStudent
    ? (user?.emergencyContacts?.filter((contact) => contact.isPrimary) ?? [])
    : [];

  // prettier-ignore
  const primaryEmergencyContact = primaryContacts.length > 0
    ? primaryContacts.reduce((max, contact) => (contact.id > max.id ? contact : max))
    : undefined;

  const defaultValues = {
    emergencyContact: {
      name: primaryEmergencyContact?.name ?? "",
      relationship: primaryEmergencyContact?.relationship ?? "",
      contactNumber: primaryEmergencyContact?.contactNumber ?? "",
      address: primaryEmergencyContact?.address ?? "",
    },
  };

  const mutation = useMutation({
    mutationFn: api.updateEmergencyContact,
    onSuccess: (data) => {
      updateUser(data.user);

      setIsEditing(false);
      showSnackbar("Emergency contact updated successfully");
    },
  });

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: UpdateEmergencyContactRequestSchema,
      onChange: UpdateEmergencyContactRequestSchema,
      onSubmit: UpdateEmergencyContactRequestSchema,
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
          <Appbar.Content title="Emergency Contact" />

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

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshUser} />
          }
        >
          <AppView>
            <EmergencyContactFields form={form} editable={isEditing} />

            <form.ErrorMessage />
          </AppView>
        </ScrollView>
      </form.AppForm>
    </SafeView>
  );
}
