import { StyleSheet, ViewStyle } from "react-native";

import { useTheme } from "@/store/settings.store";
import { Props as ChipProps } from "./index";

type ChipStyleProps = Pick<
  ChipProps,
  "variant" | "size" | "selected" | "disabled"
>;

const DISABLED_OPACITY = 0.38;

export const useChipStyles = ({
  variant,
  size,
  selected,
  disabled,
}: ChipStyleProps) => {
  const theme = useTheme();
  const isOutlined = variant === "outlined";

  const backgroundColor = disabled
    ? isOutlined
      ? "transparent"
      : theme.colors.surfaceDisabled
    : selected
      ? theme.colors.secondaryContainer
      : isOutlined
        ? theme.colors.surface
        : theme.colors.secondaryContainer;

  const borderColor = !isOutlined
    ? "transparent"
    : disabled
      ? theme.colors.surfaceDisabled
      : theme.colors.outlineVariant;

  const textColor = disabled
    ? theme.colors.onSurfaceDisabled
    : theme.colors.onSecondaryContainer;

  const contentOpacity = disabled ? DISABLED_OPACITY : 1;

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      flexShrink: 0,
      gap: 6,
      minHeight: size === "small" ? 18 : 28,
      paddingHorizontal: size === "small" ? 8 : 12,
      borderRadius: 8,
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