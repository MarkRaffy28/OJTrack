import "react-native-gesture-handler";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";

import { ThemeProvider } from "@react-navigation/native";
import { useSettingsStore } from "@/store/settings.store";
import { useTheme } from "@/store/settings.selectors";
import { useRootLayoutStyles } from "@/styles/rootLayout.styles";

export default function RootLayout() {
  const theme = useTheme();
  const styles = useRootLayoutStyles();

  useEffect(() => {
    const hydrateAndPreload = async () => {
      await useSettingsStore.getState().hydrate();
    };

    hydrateAndPreload();
  }, []);

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <PaperProvider theme={theme}>
        <ThemeProvider value={styles.navTheme}>
          <StatusBar style={styles.statusBar.container} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: styles.stack.content,
              animation: "slide_from_right",
            }}
          />
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
