import { Pressable, StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { Icon, Text } from "react-native-paper";

import { useChipStyles } from "./styles";

export type Props = {
  text: string;
  variant?: "filled" | "outlined";
  size?: "small" | "medium";
  selected?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  onClose?: () => void;
};

export function Chip({
  text,
  variant = "filled",
  size = "medium",
  selected = false,
  disabled = false,
  icon,
  style,
  textStyle,
  onPress,
  onClose,
}: Props) {
  const styles = useChipStyles({ variant, size, selected, disabled });

  const { textColor } = styles;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [styles.container(pressed), style]}
    >
      {icon && (
        <View style={styles.icon}>
          <Icon source={icon} size={16} color={textColor} />
        </View>
      )}

      <Text
        variant={size === "small" ? "labelSmall" : "labelMedium"}
        style={[styles.text, textStyle]}
        numberOfLines={1}
      >
        {text}
      </Text>

      {onClose && !disabled && (
        <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
          <Icon source="close" size={16} color={textColor} />
        </Pressable>
      )}
    </Pressable>
  );
}