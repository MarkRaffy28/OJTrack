import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { Appbar, Button, Text } from "react-native-paper";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { AppView } from "@/components/ui/AppView";
import { SafeView } from "@/components/ui/SafeView";
import { useAppForm } from "@/form/hook";
import { VerifyEmailRequestSchema } from "@/schemas/auth.schema";
import { useAuthUser, useUpdateUser } from "@/store/auth.store";
import { useShowSnackbar } from "@/store/snackbar.store";
import { formatCountdown } from "@/utils/time.util";
import { getApiErrorMessage } from "@/utils/api.util";

const RESEND_COOLDOWN = 5 * 60;

export default function VerifyEmailScreen() {
  const showSnackbar = useShowSnackbar();

  const user = useAuthUser();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (user?.emailVerifiedAt) {
      router.replace("/(tabs)");
    }
  }, [user?.emailVerifiedAt]);

  const hasSentOnOpen = useRef(false);
  const [cooldown, setCooldown] = useState(0);

  const verifyMutation = useMutation({
    mutationFn: api.verifyEmail,
    onSuccess: async ({ user }) => {
      updateUser(user);

      showSnackbar("Email verified successfully!");
      router.back();
    },
  });

  const resendMutation = useMutation({
    mutationFn: api.sendVerificationCode,
    onSuccess: () => {
      setCooldown(RESEND_COOLDOWN);
      showSnackbar("A new verification code has been sent.");
    },
    onError: (error) => {
      showSnackbar(getApiErrorMessage(error), "error");
    },
  });

  const sendMutation = useMutation({
    mutationFn: api.sendVerificationCode,
    onSuccess: () => {
      setCooldown(RESEND_COOLDOWN);
    },
    onError: (error) => {
      showSnackbar(getApiErrorMessage(error), "error");
    },
  });

  const handleSend = () => sendMutation.mutate();
  const handleResend = () => resendMutation.mutate();

  useEffect(() => {
    if (hasSentOnOpen.current) return;

    hasSentOnOpen.current = true;

    handleSend();
  }, [hasSentOnOpen, sendMutation]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const form = useAppForm({
    defaultValues: {
      otp: "",
    },
    validators: {
      onMount: VerifyEmailRequestSchema,
      onChange: VerifyEmailRequestSchema,
      onSubmit: VerifyEmailRequestSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await verifyMutation.mutateAsync(value);
      } catch (error) {
        form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
      }
    },
  });

  return (
    <SafeView>
      <Appbar.Header elevated statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Verify Email" />

        {sendMutation.isPending && (
          <ActivityIndicator style={{ marginRight: 16 }} />
        )}
      </Appbar.Header>

      <ScrollView>
        <AppView>
          <form.AppForm>
            <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
              Verify your email address
            </Text>

            {sendMutation.isSuccess && (
              <>
                <Text variant="bodyMedium">
                  Enter the 6-digit code sent to {user?.email}
                </Text>

                <form.AppField name="otp">
                  {(field) => <field.OTPField mode="edit" />}
                </form.AppField>

                <form.ErrorMessage />

                <form.Submit submitLabel="Verify" submittingLabel="Verifying..." />

                <Text>Didn't receive the code?</Text>

                <Button
                  mode="text"
                  onPress={handleResend}
                  disabled={cooldown > 0 || resendMutation.isPending}
                  loading={resendMutation.isPending}
                >
                  {cooldown > 0
                    ? `Resend code in ${formatCountdown(cooldown)}`
                    : "Resend code"}
                </Button>
              </>
            )}

            {!sendMutation.isSuccess && !sendMutation.isPending && (
              <>
                <Text variant="bodyMedium">An error occurred while sending the code.</Text>

                <Button
                  mode="contained"
                  onPress={handleSend}
                  disabled={cooldown > 0 || sendMutation.isPending}
                  loading={sendMutation.isPending}
                >
                  {cooldown > 0
                    ? `Resend code in ${formatCountdown(cooldown)}`
                    : "Resend code"}
                </Button>
              </>
            )}
          </form.AppForm>
        </AppView>
      </ScrollView>
    </SafeView>
  );
}
