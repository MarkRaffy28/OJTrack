import { useRef, useState } from "react";
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
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { ContactFields } from "@/components/fields/ContactFields";
import { EmergencyContactFields } from "@/components/fields/EmergencyContactFields";
import { IdentityFields } from "@/components/fields/IdentityFields";
import { PasswordRegistrationFields } from "@/components/fields/PasswordRegistrationFields";
import { PasswordStrength } from "@/components/fields/PasswordStrength";
import { PersonalFields } from "@/components/fields/PersonalFields";
import { SafeView } from "@/components/ui/SafeView";

import { ICON_SIZES } from "@/constants/icons.constants";
import { useAppForm } from "@/form/hook";
import {
  CommonRegistrationRequestSchema,
  RegistrationResponse,
  StudentRegistrationRequestSchema,
} from "@/schemas/auth.schema";
import { useAuthUser, useUpdateUser } from "@/store/auth.store";
import { useTheme } from "@/store/settings.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { getMaterialColor } from "@/utils/color.util";
import { registrationValidator } from "@/validators/auth.validator";

const TOP_HEIGHT = 240;
const WAVE_HEIGHT = 70;
const WAVE_OVERLAP = 60;
const CONTENT_MAX_WIDTH = 440;

type UnifiedRegistrationRequest = z.infer<typeof CommonRegistrationRequestSchema> &
  Partial<z.infer<typeof StudentRegistrationRequestSchema>>;

type StepConfig = {
  id: number;
  title: string;
  icon: string;
};

const STEP_CONFIGS: StepConfig[] = [
  { id: 0, title: "Account", icon: "account-key" },
  { id: 1, title: "Personal Info", icon: "information" },
  { id: 2, title: "Contact", icon: "phone" },
  { id: 3, title: "Emergency Contact", icon: "car-emergency" },
];

export default function CompleteRegistrationScreen() {
  const user = useAuthUser();
  const updateUser = useUpdateUser();
  const theme = useTheme();
  const isStudent = user?.role === "student";
  const maxSteps = isStudent ? 4 : 3;

  const stepOpacity = useRef(new Animated.Value(1)).current;

  const [currentStep, setCurrentStep] = useState(0);

  const commonDefaultValues: UnifiedRegistrationRequest = {
    userId: user?.userId ?? "",
    newPassword: "",
    confirmPassword: "",
    username: "",
    firstName: user?.firstName ?? "",
    middleName: user?.middleName ?? null,
    lastName: user?.lastName ?? "",
    extensionName: user?.extensionName ?? null,
    birthDate: user?.birthDate ?? "",
    gender: user?.gender ?? "Male",
    homeAddress: user?.homeAddress ?? "",
    presentAddress: user?.presentAddress ?? "",
    contactNumber: user?.contactNumber ?? "",
    email: "",
  };

  const studentDefaultValues: UnifiedRegistrationRequest = {
    ...commonDefaultValues,
    emergencyContact: {
      name: (isStudent ? user?.emergencyContacts?.[0]?.name : "") ?? "",
      relationship: (isStudent ? user?.emergencyContacts?.[0]?.relationship : "") ?? "",
      address: (isStudent ? user?.emergencyContacts?.[0]?.address : "") ?? "",
      contactNumber: (isStudent ? user?.emergencyContacts?.[0]?.contactNumber : "") ?? "",
    },
  };

  const onSuccess = async (data: RegistrationResponse) => {
    updateUser(data.user);
    router.replace("(tabs)/home");
  };

  const studentMutation = useMutation({
    mutationFn: api.registerStudent,
    onSuccess,
  });

  const supervisorMutation = useMutation({
    mutationFn: api.registerSupervisor,
    onSuccess,
  });

  const form = useAppForm(
    isStudent
      ? {
          defaultValues: studentDefaultValues,
          validators: {
            onMount: registrationValidator(StudentRegistrationRequestSchema),
            onChange: registrationValidator(StudentRegistrationRequestSchema),
            onSubmit: registrationValidator(StudentRegistrationRequestSchema),
          },
          onSubmit: async ({ value }) => {
            try {
              const payload = StudentRegistrationRequestSchema.parse(value);
              await studentMutation.mutateAsync(payload);
            } catch (error) {
              form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
            }
          },
        }
      : {
          defaultValues: commonDefaultValues,
          validators: {
            onMount: registrationValidator(CommonRegistrationRequestSchema),
            onChange: registrationValidator(CommonRegistrationRequestSchema),
            onSubmit: registrationValidator(CommonRegistrationRequestSchema),
          },
          onSubmit: async ({ value }) => {
            try {
              const payload = CommonRegistrationRequestSchema.parse(value);
              await supervisorMutation.mutateAsync(payload);
            } catch (error) {
              form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
            }
          },
        },
  );

  const handleStepTransition = (newStep: number) => {
    Animated.parallel([
      Animated.timing(stepOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(newStep);
      stepOpacity.setValue(0);
      Animated.timing(stepOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentStep < maxSteps - 1) {
      handleStepTransition(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep === 0) {
      router.navigate("/login");
    } else {
      handleStepTransition(currentStep - 1);
    }
  };

  const blobPrimary = getMaterialColor("amber", { lightShade: 200, darkShade: 800 });
  const blobSecondary = getMaterialColor("teal", { lightShade: 200, darkShade: 800 });

  const stepConfig = STEP_CONFIGS[currentStep];
  const isLastStep = currentStep === maxSteps - 1;

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
                    Step {currentStep + 1} of {maxSteps}
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
              <form.AppForm>
                {/* Step 0: Account */}
                {currentStep === 0 && (
                  <View style={styles.fieldsGroup}>
                    <IdentityFields
                      form={form}
                      fields={["userId"]}
                      readOnlyFields={["userId"]}
                    />
                    <IdentityFields form={form} fields={["username"]} />

                    <Text
                      variant="labelMedium"
                      style={[
                        styles.sectionLabel,
                        { color: theme.colors.onBackground, marginTop: 24 },
                      ]}
                    >
                      Set Password
                    </Text>

                    <PasswordRegistrationFields form={form} />

                    <form.Subscribe selector={(state) => state.values.newPassword}>
                      {(password) => <PasswordStrength password={password ?? ""} />}
                    </form.Subscribe>
                  </View>
                )}

                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <View style={styles.fieldsGroup}>
                    <IdentityFields
                      form={form}
                      fields={["firstName", "middleName", "lastName", "extensionName"]}
                    />

                    <PersonalFields form={form} fields={["birthDate", "gender"]} />
                  </View>
                )}

                {/* Step 2: Contact */}
                {currentStep === 2 && (
                  <View style={styles.fieldsGroup}>
                    <ContactFields
                      form={form}
                      fields={["homeAddress", "presentAddress", "contactNumber", "email"]}
                    />
                  </View>
                )}

                {/* Step 3: Emergency Contact (students only) */}
                {currentStep === 3 && isStudent && (
                  <View style={styles.fieldsGroup}>
                    <EmergencyContactFields form={form} />
                  </View>
                )}

                <form.ErrorMessage />

                {/* Navigation */}
                <View style={styles.navigationWrap}>
                  <Pressable onPress={handlePrev} style={styles.prevButtonWrap}>
                    <View
                      style={[styles.prevButton, { borderColor: theme.colors.outline }]}
                    >
                      <Icon
                        source="chevron-left"
                        size={ICON_SIZES.md}
                        color={theme.colors.onSurface}
                      />
                    </View>
                  </Pressable>

                  {isLastStep ? (
                    <form.Submit
                      submitLabel="Complete Registration"
                      submittingLabel="Submitting…"
                      style={styles.submitButton}
                    />
                  ) : (
                    <Pressable
                      onPress={handleNext}
                      style={({ pressed }) => [
                        styles.nextButtonWrap,
                        pressed && styles.nextButtonPressed,
                      ]}
                    >
                      <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.nextButton}
                      >
                        <Text
                          style={[
                            styles.nextButtonText,
                            { color: theme.colors.onPrimary },
                          ]}
                        >
                          Next
                        </Text>
                        <Icon
                          source="chevron-right"
                          size={ICON_SIZES.md}
                          color={theme.colors.onPrimary}
                        />
                      </LinearGradient>
                    </Pressable>
                  )}
                </View>
              </form.AppForm>
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
  sectionLabel: {
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
  nextButtonWrap: {
    flex: 1,
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  submitButton: {
    flex: 1,
  },
});
