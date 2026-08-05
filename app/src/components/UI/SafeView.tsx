import { ComponentProps, ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { useTheme } from "@/store/settings.selectors";
import { useAppStyles } from "@/styles/app.styles";

interface Props extends ComponentProps<typeof SafeAreaView> {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

export function SafeView({ style, children, ...props }: Props) {
  const theme = useTheme();
  const styles = useAppStyles();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(theme.colors.background, { duration: 300 }),
    };
  });

  return (
    <AnimatedSafeAreaView style={[styles.safeView, animatedStyle, style]} {...props}>
      {children}
    </AnimatedSafeAreaView>
  );
}
