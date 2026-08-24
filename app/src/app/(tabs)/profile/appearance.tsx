import { ScrollView } from "react-native";
import { router } from "expo-router";
import { Appbar, List, Switch, Tooltip } from "react-native-paper";

import { AppView } from "@/components/ui/AppView";
import { SafeView } from "@/components/ui/SafeView";
import { useMode, useResetTheme, useSetMode } from "@/store/settings.store";

export default function AppearanceScreen() {
  const mode = useMode();

  const setMode = useSetMode();
  const resetTheme = useResetTheme();

  return (
    <SafeView>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Appearance" />

        <Tooltip title="Reset Theme">
          <Appbar.Action icon="restart" onPress={() => void resetTheme()} />
        </Tooltip>
      </Appbar.Header>

      <ScrollView>
        <AppView>
          <List.Section>
            <List.Subheader>Theme Mode</List.Subheader>

            <List.Item
              title="Dark Mode"
              right={() => (
                <Switch
                  value={mode === "dark"}
                  onValueChange={() => setMode(mode === "dark" ? "light" : "dark")}
                />
              )}
            />
          </List.Section>
        </AppView>
      </ScrollView>
    </SafeView>
  );
}
