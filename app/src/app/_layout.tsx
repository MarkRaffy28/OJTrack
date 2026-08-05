import "react-native-gesture-handler";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useSettingsStore } from "@/store/settings.store";
import { useTheme } from "@/store/settings.selectors";
import { useRootLayoutStyles } from "@/styles/rootLayout.styles";

export default function RootLayout() {
  const theme = useTheme();
  const styles = useRootLayoutStyles();

  const queryClient = new QueryClient();

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
          <QueryClientProvider client={queryClient}>
            <StatusBar style={styles.statusBar.container} />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </QueryClientProvider>
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
