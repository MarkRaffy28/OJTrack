import "react-native-gesture-handler";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SplashScreen } from "@/components/ui/SplashScreen";
import { useAuthStore, useIsHydrated } from "@/store/auth.store";
import { useSettingsStore, useTheme } from "@/store/settings.store";
import { useRootLayoutStyles } from "@/styles/rootLayout.styles";

const queryClient = new QueryClient();

export default function RootLayout() {
  const theme = useTheme();
  const styles = useRootLayoutStyles();

  const isAuthHydrated = useIsHydrated();

  useEffect(() => {
    const hydrate = async () => {
      await Promise.all([
        useAuthStore.getState().hydrate(),
        useSettingsStore.getState().hydrate(),
      ]);
    };

    hydrate();
  }, []);

  if (!isAuthHydrated) {
    return <SplashScreen />;
  }

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
