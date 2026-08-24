import { Pressable, StyleSheet } from "react-native";
import { Icon } from "react-native-paper";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { useNavigationState } from "@react-navigation/native";

import { ICON_SIZES } from "@/constants/icons.constants";
import { useTheme } from "@/store/settings.store";

export function QRTabButton({ onPress }: BottomTabBarButtonProps) {
  const theme = useTheme();

  const focused = useNavigationState((state) => {
    const activeRoute = state?.routes[state.index];
    return activeRoute?.name === "qr";
  });

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: focused ? theme.colors.primaryContainer : theme.colors.primary,
        },
      ]}
    >
      <Icon
        source="qrcode-scan"
        size={ICON_SIZES.xl}
        color={focused ? theme.colors.onPrimaryContainer : theme.colors.onPrimary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,

    justifyContent: "center",
    alignItems: "center",

    alignSelf: "center",
    marginTop: -28,

    elevation: 3,
  },

  buttonFocused: {},
});
