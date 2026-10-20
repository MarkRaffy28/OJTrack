import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import { Icon, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { ContactFields } from "@/components/fields/ContactFields";
import { ForgotPasswordFields } from "@/components/fields/ForgotPasswordFields";
import { PasswordStrength } from "@/components/fields/PasswordStrength";
import { SafeView } from "@/components/ui/SafeView";

import { ICON_SIZES } from "@/constants/icons.constants";
import { useAppForm } from "@/form/hook";
import {
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  VerifyForgotPasswordOTPRequestSchema,
} from "@/schemas/auth.schema";
import { useAuthUser } from "@/store/auth.store";
import { useShowSnackbar } from "@/store/snackbar.store";
import { useTheme } from "@/store/settings.store";
import { formatCountdown } from "@/utils/time.util";
import { getApiErrorMessage } from "@/utils/api.util";
import { getMaterialColor } from "@/utils/color.util";
import { resetPasswordValidator } from "@/validators/auth.validator";

const TOP_HEIGHT = 240;
const WAVE_HEIGHT = 70;
const WAVE_OVERLAP = 60;
const CONTENT_MAX_WIDTH = 440;
const RESEND_COOLDOWN = 5 * 60;

type StepConfig = {
  id: number;
  title: string;
  icon: string;
};

const STEP_CONFIGS: StepConfig[] = [
  { id: 0, title: "Email", icon: "email-outline" },
  { id: 1, title: "Verify", icon: "shield-check" },
  { id: 2, title: "Reset Password", icon: "lock-reset" },
];

export default function ForgotPasswordScreen() {
  const theme = useTheme();

  const showSnackbar = useShowSnackbar();
  const user = useAuthUser();

  const stepOpacity = useRef(new Animated.Value(1)).current;
  const hasSentOnOpen = useRef(false);

  const [cooldown, setCooldown] = useState(0);
  const [step, setStep] = useState<number>(user ? 1 : 0);
  const [email, setEmail] = useState<string>(user?.email ?? "");

  const sendMutation = useMutation({
    mutationFn: api.forgotPassword,
    onSuccess: () => {
      setCooldown(RESEND_COOLDOWN);
      handleStepTransition(1);
    },
    onError: (error) => {
      showSnackbar(getApiErrorMessage(error), "error");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: api.verifyForgotPassword,
    onSuccess: () => {
      handleStepTransition(2);
    },
    onError: (error) => {
      otpForm.setErrorMap({ onSubmit: getApiErrorMessage(error) });
    },
  });

  const resendMutation = useMutation({
    mutationFn: api.forgotPassword,
    onSuccess: () => {
      setCooldown(RESEND_COOLDOWN);
      showSnackbar("A new verification code has been sent.");
    },
    onError: (error) => {
      showSnackbar(getApiErrorMessage(error), "error");
    },
  });

  const resetMutation = useMutation({
    mutationFn: api.resetPassword,
    onSuccess: () => {
      showSnackbar("Password reset successful.");
      router.back();
    },
    onError: (error) => {
      resetForm.setErrorMap({ onSubmit: getApiErrorMessage(error) });
    },
  });

  const emailForm = useAppForm({
    defaultValues: {
      email: user?.email ?? "",
    },
    validators: {
      onMount: ForgotPasswordRequestSchema,
      onChange: ForgotPasswordRequestSchema,
      onSubmit: ForgotPasswordRequestSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setEmail(value.email);
        await sendMutation.mutateAsync(value);
      } catch {}
    },
  });

  const otpForm = useAppForm({
    defaultValues: {
      email,
      otp: "",
    },
    validators: {
      onMount: VerifyForgotPasswordOTPRequestSchema,
      onChange: VerifyForgotPasswordOTPRequestSchema,
      onSubmit: VerifyForgotPasswordOTPRequestSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await verifyMutation.mutateAsync(value);
      } catch {}
    },
  });

  const resetForm = useAppForm({
    defaultValues: {
      email,
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onMount: resetPasswordValidator(ResetPasswordRequestSchema),
      onChange: resetPasswordValidator(ResetPasswordRequestSchema),
      onSubmit: resetPasswordValidator(ResetPasswordRequestSchema),
    },
    onSubmit: async ({ value }) => {
      try {
        await resetMutation.mutateAsync(value);
      } catch {}
    },
  });

  useEffect(() => {
    if (!user?.email || hasSentOnOpen.current) return;

    hasSentOnOpen.current = true;
    sendMutation.mutate({
      email: user.email,
    });
  }, [user?.email]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleStepTransition = (newStep: number) => {
    Animated.parallel([
      Animated.timing(stepOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(newStep);
      stepOpacity.setValue(0);
      Animated.timing(stepOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const handlePrev = () => {
    const minStep = user ? 1 : 0;
    if (step === minStep) {
      router.back();
    } else {
      handleStepTransition(step - 1);
    }
  };

  const blobPrimary = getMaterialColor("amber", { lightShade: 200, darkShade: 800 });
  const blobSecondary = getMaterialColor("teal", { lightShade: 200, darkShade: 800 });

  const stepConfig = STEP_CONFIGS[step];
  const maxSteps = user ? 2 : 3;

  return (
    <SafeView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { backgroundColor: theme.colors.background },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.top}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <View
              style={[
                styles.blob,
                styles.blobOne,
                { backgroundColor: blobPrimary, opacity: 0.15 },
              ]}
              pointerEvents="none"
            />
            <View
              style={[
                styles.blob,
                styles.blobTwo,
                { backgroundColor: blobSecondary, opacity: 0.14 },
              ]}
              pointerEvents="none"
            />

            <View style={styles.stepIndicatorWrap}>
              <View
                style={[
                  styles.stepIndicator,
                  { backgroundColor: theme.colors.onPrimary, opacity: 0.12 },
                ]}
              />
              <View style={styles.stepContent}>
                <Icon
                  source={stepConfig.icon}
                  size={ICON_SIZES.md}
                  color={theme.colors.onPrimary}
                />
                <View style={styles.stepTextWrap}>
                  <Text style={[styles.stepLabel, { color: theme.colors.onPrimary }]}>
                    Step {user ? step : step + 1} of {maxSteps}
                  </Text>
                  <Text
                    style={[styles.stepTitle, { color: theme.colors.onPrimary }]}
                    numberOfLines={1}
                  >
                    {stepConfig.title}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.waveWrap} pointerEvents="none">
            <Svg
              width="100%"
              height={WAVE_HEIGHT}
              viewBox="0 0 375 70"
              preserveAspectRatio="none"
            >
              <Path
                d="M0,35 C 90,0 280,68 375,14 L375,70 L0,70 Z"
                fill={theme.colors.background}
              />
            </Svg>
          </View>

          <Animated.View
            style={[
              styles.contentSection,
              {
                backgroundColor: theme.colors.background,
                opacity: stepOpacity,
              },
            ]}
          >
            <View style={[styles.contentWrap, { maxWidth: CONTENT_MAX_WIDTH }]}>
              {/* Email Step */}
              {step === 0 && (
                <emailForm.AppForm>
                  <View style={styles.fieldsGroup}>
                    <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
                      Enter your email address
                    </Text>

                    <Text variant="bodyMedium" style={{ marginBottom: 24 }}>
                      We'll send you a verification code to reset your password.
                    </Text>

                    <ContactFields form={emailForm} fields={["email"]} />

                    <emailForm.ErrorMessage />

                    {/* Navigation */}
                    <View style={styles.navigationWrap}>
                      <Pressable onPress={handlePrev} style={styles.prevButtonWrap}>
                        <View
                          style={[
                            styles.prevButton,
                            { borderColor: theme.colors.outline },
                          ]}
                        >
                          <Icon
                            source="chevron-left"
                            size={ICON_SIZES.md}
                            color={theme.colors.onSurface}
                          />
                        </View>
                      </Pressable>

                      <emailForm.Submit
                        submitLabel="Send Code"
                        submittingLabel="Sending…"
                        style={styles.submitButton}
                      />
                    </View>
                  </View>
                </emailForm.AppForm>
              )}

              {/* OTP Verification Step */}
              {step === 1 && (
                <otpForm.AppForm>
                  <View style={styles.fieldsGroup}>
                    <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
                      Enter verification code
                    </Text>

                    <Text variant="bodyMedium" style={{ marginBottom: 24 }}>
                      A 6-digit code has been sent to {email || "your email"}.
                    </Text>

                    <otpForm.AppField name="otp">
                      {(field) => <field.OTPField mode="edit" />}
                    </otpForm.AppField>

                    <otpForm.ErrorMessage />

                    <Text
                      variant="bodySmall"
                      style={[styles.resendLabel, { color: theme.colors.onBackground }]}
                    >
                      Didn't receive the code?
                    </Text>

                    <Pressable
                      onPress={() => resendMutation.mutate({ email })}
                      disabled={cooldown > 0 || resendMutation.isPending}
                    >
                      <Text
                        style={[
                          styles.resendText,
                          {
                            color:
                              cooldown > 0 || resendMutation.isPending
                                ? theme.colors.outline
                                : theme.colors.primary,
                          },
                        ]}
                      >
                        {cooldown > 0
                          ? `Resend in ${formatCountdown(cooldown)}`
                          : "Resend code"}
                      </Text>
                    </Pressable>

                    {/* Navigation */}
                    <View style={styles.navigationWrap}>
                      <Pressable onPress={handlePrev} style={styles.prevButtonWrap}>
                        <View
                          style={[
                            styles.prevButton,
                            { borderColor: theme.colors.outline },
                          ]}
                        >
                          <Icon
                            source="chevron-left"
                            size={ICON_SIZES.md}
                            color={theme.colors.onSurface}
                          />
                        </View>
                      </Pressable>

                      <otpForm.Submit
                        submitLabel="Verify"
                        submittingLabel="Verifying…"
                        style={styles.submitButton}
                      />
                    </View>
                  </View>
                </otpForm.AppForm>
              )}

              {/* Password Reset Step */}
              {step === 2 && (
                <resetForm.AppForm>
                  <View style={styles.fieldsGroup}>
                    <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
                      Create a new password
                    </Text>

                    <Text variant="bodyMedium" style={{ marginBottom: 24 }}>
                      Enter a strong password to secure your account.
                    </Text>

                    <ForgotPasswordFields form={resetForm} />

                    <resetForm.Subscribe selector={(state) => state.values.newPassword}>
                      {(password) => <PasswordStrength password={password ?? ""} />}
                    </resetForm.Subscribe>

                    <resetForm.ErrorMessage />

                    {/* Navigation */}
                    <View style={styles.navigationWrap}>
                      <Pressable onPress={handlePrev} style={styles.prevButtonWrap}>
                        <View
                          style={[
                            styles.prevButton,
                            { borderColor: theme.colors.outline },
                          ]}
                        >
                          <Icon
                            source="chevron-left"
                            size={ICON_SIZES.md}
                            color={theme.colors.onSurface}
                          />
                        </View>
                      </Pressable>

                      <resetForm.Submit
                        submitLabel="Reset Password"
                        submittingLabel="Resetting…"
                        style={styles.submitButton}
                      />
                    </View>
                  </View>
                </resetForm.AppForm>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: "100%",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  top: {
    height: TOP_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blobOne: {
    width: 180,
    height: 180,
    top: -60,
    right: -50,
  },
  blobTwo: {
    width: 140,
    height: 140,
    bottom: -40,
    left: -30,
  },
  stepIndicatorWrap: {
    position: "relative",
    width: "85%",
    maxWidth: 300,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 32,
  },
  stepIndicator: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  stepContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepTextWrap: {
    flex: 1,
    gap: 2,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  waveWrap: {
    marginTop: -WAVE_OVERLAP,
  },
  contentSection: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 4,
    paddingBottom: 32,
    alignItems: "center",
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  fieldsGroup: {
    gap: 4,
  },
  resendLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  navigationWrap: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  prevButtonWrap: {
    width: 44,
    height: 44,
  },
  prevButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    flex: 1,
  },
});
