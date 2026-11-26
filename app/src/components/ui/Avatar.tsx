import { Pressable, StyleSheet, View } from "react-native";
import { Icon, Avatar as PaperAvatar, useTheme } from "react-native-paper";

import { AVATAR_SIZES } from "@/constants/avatar.constants";

interface AvatarProps {
  source?: string | null;
  text?: string;
  mode?: "view" | "edit";
  variant?: "small" | "medium" | "large";
  onPress?: () => void;
}

export function Avatar({
  source,
  text,
  mode = "view",
  variant = "medium",
  onPress,
}: AvatarProps) {
  const theme = useTheme();
  const size = AVATAR_SIZES[variant];

  const avatar = source ? (
    <PaperAvatar.Image source={{ uri: source }} size={size} />
  ) : text ? (
    <PaperAvatar.Text label={text} size={size} />
  ) : (
    <PaperAvatar.Icon icon="account" size={size} />
  );

  const avatarWithBorder = (
    <View
      style={[
        {
          borderWidth: 2,
          borderColor: theme.colors.primary,
          borderRadius: size / 2,
          width: size,
          height: size,
          overflow: "hidden",
        },
      ]}
    >
      {avatar}
    </View>
  );

  if (mode !== "edit") {
    return avatarWithBorder;
  }

  return (
    <View style={styles.container}>
      {avatarWithBorder}

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.cameraButtonWrapper,
          {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.onPrimary,
          },
          pressed && onPress && { opacity: 0.8 },
        ]}
      >
        <Icon source="pencil" size={18} color={theme.colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "flex-start",
  },

  cameraButtonWrapper: {
    position: "absolute",
    right: -8,
    bottom: -2,

    width: 36,
    height: 36,
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,
  },
});
