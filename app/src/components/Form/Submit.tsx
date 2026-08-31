import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

import { useFormContext } from "@/form/context";
import { useTheme } from "@/store/settings.store";

interface Props {
  submitLabel: string;
  submittingLabel: string;
  initialValues?: Record<string, any>;
  style?: any;
  contentStyle?: any;
  labelStyle?: any;
}

export function FormSubmit({
  submitLabel,
  submittingLabel,
  initialValues,
  style,
  contentStyle,
  labelStyle,
}: Props) {
  const form = useFormContext();
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;

      const target = event.target as HTMLElement | null;
      if (target?.tagName === "TEXTAREA") return;

      event.preventDefault();
      form.handleSubmit();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [form]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 35,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 5,
    }).start();
  };

  return (
    <form.Subscribe
      selector={(state) => {
        const hasFieldErrors = Object.values(state.fieldMeta).some(
          (field: any) => field.errors.length > 0,
        );

        const { onSubmit, ...rest } = state.errorMap;
        const hasFormError = Object.values(rest).some(Boolean);

        const hasActualChanges = initialValues
          ? JSON.stringify(state.values) !== JSON.stringify(initialValues)
          : true;

        return [
          hasFieldErrors || hasFormError,
          state.isSubmitting,
          hasActualChanges,
        ] as const;
      }}
    >
      {([hasFieldErrors, isSubmitting, hasActualChanges]) => {
        const isDisabled = hasFieldErrors || isSubmitting || !hasActualChanges;

        return (
          <Pressable
            onPressIn={!isDisabled ? handlePressIn : undefined}
            onPressOut={!isDisabled ? handlePressOut : undefined}
            onPress={!isDisabled ? form.handleSubmit : undefined}
            disabled={isDisabled}
            style={[styles.pressable, style]}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <LinearGradient
                colors={
                  isDisabled
                    ? [
                        theme.colors.surfaceVariant + "66",
                        theme.colors.surfaceVariant + "66",
                      ]
                    : [theme.colors.primary + "E8", theme.colors.secondary + "E8"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.gradient,
                  {
                    shadowColor: isDisabled
                      ? theme.colors.surfaceVariant
                      : theme.colors.primary,
                  },
                ]}
              >
                <Animated.View style={[styles.content, contentStyle]}>
                  {isSubmitting && (
                    <ActivityIndicator
                      color={
                        isDisabled
                          ? theme.colors.onSurfaceVariant
                          : theme.colors.onPrimary
                      }
                      size="small"
                    />
                  )}

                  <Text
                    style={[
                      styles.label,
                      {
                        color: isDisabled
                          ? theme.colors.onSurfaceVariant
                          : theme.colors.onPrimary,
                      },
                      labelStyle,
                    ]}
                  >
                    {isSubmitting ? submittingLabel : submitLabel}
                  </Text>
                </Animated.View>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        );
      }}
    </form.Subscribe>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },

  gradient: {
    borderRadius: 32,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: "hidden",
  },

  content: {
    height: 50,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
