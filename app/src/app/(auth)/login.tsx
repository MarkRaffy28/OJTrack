import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Icon, Surface, Text } from "react-native-paper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { SafeView } from "@/components/ui/SafeView";
import { ICON_SIZES } from "@/constants/icons.constants";
import { useAppForm } from "@/form/context";
import { LoginRequestSchema } from "@/schemas/auth.schema";
import { useLogin } from "@/store/auth.store";
import { useTheme } from "@/store/settings.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { getMaterialColor } from "@/utils/color.util";

const TOP_HEIGHT = 300;
const WAVE_HEIGHT = 70;
const WAVE_OVERLAP = 60;
const CONTENT_MAX_WIDTH = 440;

export default function LoginScreen() {
  const login = useLogin();
  const theme = useTheme();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const fieldsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(formAnim, {
          toValue: 0,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fieldsOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoAnim, formAnim, formOpacity, fieldsOpacity]);

  const mutation = useMutation({
    mutationFn: api.login,
    onSuccess: async (session) => {
      await login(session);

      if (session.user.status === "pre_activated") {
        router.push("/complete-registration");
      } else {
        router.push("/");
      }
    },
  });

  const form = useAppForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
    validators: {
      onMount: LoginRequestSchema,
      onChange: LoginRequestSchema,
      onSubmit: LoginRequestSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
      }
    },
  });

  const blobPrimary = getMaterialColor("pink", { lightShade: 200, darkShade: 800 });
  const blobSecondary = getMaterialColor("cyan", { lightShade: 200, darkShade: 800 });

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

            <Animated.View
              style={[
                styles.logoBadge,
                {
                  opacity: logoAnim,
                  transform: [{ scale: logoAnim }],
                  shadowColor: theme.colors.onSurface,
                },
              ]}
            >
              <View
                style={[
                  styles.logoBadgeFill,
                  { backgroundColor: theme.colors.onPrimary, opacity: 0.12 },
                ]}
              />
              <View
                style={[
                  styles.logoBadgeBorder,
                  { borderColor: theme.colors.onPrimary, opacity: 0.4 },
                ]}
              />
              <Text style={[styles.logoMark, { color: theme.colors.onPrimary }]}>
                OJT
              </Text>
            </Animated.View>
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
              styles.formSection,
              {
                backgroundColor: theme.colors.background,
                opacity: formOpacity,
                transform: [{ translateY: formAnim }],
              },
            ]}
          >
            <View style={[styles.contentWrap, { maxWidth: CONTENT_MAX_WIDTH }]}>
              <Text style={[styles.title, { color: theme.colors.onBackground }]}>
                Welcome back
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                Continue your OJT journey.
              </Text>

              <Surface
                style={[
                  styles.noticeBox,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Icon
                  source="lightbulb-outline"
                  size={ICON_SIZES.sm}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodySmall"
                  style={[styles.noticeText, { color: theme.colors.onSurfaceVariant }]}
                >
                  First-time login? You'll be asked to complete a one-time registration.
                </Text>
              </Surface>

              <Animated.View style={[styles.fieldsGroup, { opacity: fieldsOpacity }]}>
                <form.AppForm>
                  <View>
                    <form.AppField name="identifier">
                      {(field) => (
                        <field.Field
                          label="Identifier"
                          placeholder="Enter User ID, Username or Email"
                          maxLength={100}
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="username"
                          textContentType="username"
                          icon="key-outline"
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="password">
                      {(field) => (
                        <field.Field
                          label="Password"
                          placeholder="Enter Password"
                          autoCapitalize="none"
                          autoComplete="password"
                          textContentType="password"
                          icon="lock-outline"
                          secure
                        />
                      )}
                    </form.AppField>

                    <Button
                      mode="text"
                      compact
                      onPress={() => {}}
                      style={styles.forgotWrap}
                      labelStyle={styles.forgotText}
                      textColor={theme.colors.primary}
                    >
                      Forgot Password?
                    </Button>

                    <form.ErrorMessage />

                    <form.Submit
                      submitLabel="LOGIN"
                      submittingLabel="LOGGING IN…"
                      style={styles.submitButton}
                    />
                  </View>
                </form.AppForm>
              </Animated.View>
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
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },
  logoBadgeFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  logoBadgeBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  logoMark: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1,
  },
  waveWrap: {
    marginTop: -WAVE_OVERLAP,
  },
  formSection: {
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
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  noticeText: {
    flex: 1,
    lineHeight: 18,
  },
  fieldsGroup: {
    gap: 4,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 12,
  },
});
