import { Pressable, StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { Icon, Text } from "react-native-paper";

import { ICON_SIZES } from "@/constants/icons.constants";
import { useChipStyles } from "./styles";

export type Props = {
  text: string;
  variant?: "filled" | "outlined";
  tone?: "neutral" | "success" | "warning" | "info";
  size?: "small" | "medium";
  selected?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  onClose?: () => void;
};

export function Chip({
  text,
  variant = "filled",
  tone = "neutral",
  size = "medium",
  selected = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  onPress,
  onClose,
}: Props) {
  const styles = useChipStyles({ variant, size, selected, disabled, tone });

  const { textColor } = styles;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [styles.container(pressed), style]}
    >
      {leftIcon && (
        <View style={styles.icon}>
          <Icon source={leftIcon} size={ICON_SIZES.sm} color={textColor} />
        </View>
      )}

      <Text
        variant={size === "small" ? "labelSmall" : "labelMedium"}
        style={[styles.text, textStyle]}
        numberOfLines={1}
      >
        {text}
      </Text>

      {rightIcon && (
        <View style={styles.icon}>
          <Icon source={rightIcon} size={ICON_SIZES.sm} color={textColor} />
        </View>
      )}

      {onClose && !disabled && !rightIcon && (
        <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
          <Icon source="close" size={ICON_SIZES.sm} color={textColor} />
        </Pressable>
      )}
    </Pressable>
  );
}