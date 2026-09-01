import { StyleSheet, ViewStyle } from "react-native";

import { useTheme } from "@/store/settings.store";
import { Props as ChipProps } from "./index";

type ChipStyleProps = Pick<
  ChipProps,
  "variant" | "size" | "selected" | "disabled" | "tone"
>;

const DISABLED_OPACITY = 0.38;

export const useChipStyles = ({
  variant,
  size,
  selected,
  disabled,
  tone = "neutral",
}: ChipStyleProps) => {
  const theme = useTheme();
  const isOutlined = variant === "outlined";

  const toneColors = {
    neutral: {
      container: theme.colors.secondaryContainer,
      onContainer: theme.colors.onSecondaryContainer,
      accent: theme.colors.outlineVariant,
    },
    success: {
      container: theme.colors.successContainer,
      onContainer: theme.colors.onSuccessContainer,
      accent: theme.colors.success,
    },
    warning: {
      container: theme.colors.warningContainer,
      onContainer: theme.colors.onWarningContainer,
      accent: theme.colors.warning,
    },
    info: {
      container: theme.colors.infoContainer,
      onContainer: theme.colors.onInfoContainer,
      accent: theme.colors.info,
    },
  }[tone];

  const backgroundColor = disabled
    ? isOutlined
      ? "transparent"
      : theme.colors.surfaceDisabled
    : selected
      ? toneColors.container
      : isOutlined
        ? theme.colors.surface
        : toneColors.container;

  const borderColor = !isOutlined
    ? "transparent"
    : disabled
      ? theme.colors.surfaceDisabled
      : toneColors.accent;

  const textColor = disabled
    ? theme.colors.onSurfaceDisabled
    : toneColors.onContainer;

  const contentOpacity = disabled ? DISABLED_OPACITY : 1;

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      flexShrink: 0,
      gap: 6,
      minHeight: size === "small" ? 24 : 32,
      paddingHorizontal: size === "small" ? 8 : 12,
      borderRadius: 12,
    },

    icon: {
      tintColor: textColor,
      opacity: contentOpacity,
    },

    text: {
      color: textColor,
      opacity: contentOpacity,
    },

    closeButton: {
      marginLeft: 2,
    },
  });

  const { container, ...rest } = styles;

  return {
    ...rest,

    textColor,

    container: (pressed: boolean): ViewStyle => ({
      ...container,
      backgroundColor,
      borderColor,
      borderWidth: isOutlined ? 1 : 0,
      opacity: pressed ? 0.7 : 1,
    }),
  };
};