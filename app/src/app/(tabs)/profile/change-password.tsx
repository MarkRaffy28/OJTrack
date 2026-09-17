import { ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Appbar, Button } from "react-native-paper";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { ChangePasswordFields } from "@/components/fields/ChangePasswordFields";
import { PasswordStrength } from "@/components/fields/PasswordStrength";
import { AppView } from "@/components/ui/AppView";
import { SafeView } from "@/components/ui/SafeView";
import { useAppForm } from "@/form/hook";
import { ChangePasswordRequestSchema } from "@/schemas/auth.schema";
import { useShowSnackbar } from "@/store/snackbar.store";
import { useTheme } from "@/store/settings.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { changePasswordValidator } from "@/validators/auth.validator";

export default function ChangePasswordScreen() {
  const theme = useTheme();

  const showSnackbar = useShowSnackbar();

  const mutation = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      showSnackbar("Password changed successfully");
      router.back();
    },
  });

  const form = useAppForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onMount: changePasswordValidator(ChangePasswordRequestSchema),
      onChange: changePasswordValidator(ChangePasswordRequestSchema),
      onSubmit: changePasswordValidator(ChangePasswordRequestSchema),
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
      }
    },
  });

  return (
    <SafeView>
      <form.AppForm>
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Change Password" />
        </Appbar.Header>

        <ScrollView>
          <AppView>
            <ChangePasswordFields form={form} />

            <Button
              mode="text"
              compact
              onPress={() => router.navigate("/forgot-password")}
              style={styles.forgotWrap}
              labelStyle={styles.forgotText}
              textColor={theme.colors.primary}
            >
              Forgot Password?
            </Button>

            <form.Subscribe selector={(state) => state.values.newPassword}>
              {(password) => <PasswordStrength password={password ?? ""} />}
            </form.Subscribe>

            <form.ErrorMessage />

            <form.Submit
              submitLabel="Change Password"
              submittingLabel="Changing Password"
            />
          </AppView>
        </ScrollView>
      </form.AppForm>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
