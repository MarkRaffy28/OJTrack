import { router } from "expo-router";
import { Button } from "react-native-paper";

import { SafeView } from "@/components/ui/SafeView";
import { useLogout } from "@/store/auth.store";

export default function ProfileScreen() {
  const logout = useLogout();

  return (
    <SafeView>
      <Button
        onPress={() => {
          logout();
          router.replace("/");
        }}
      >
        Logout
      </Button>
    </SafeView>
  );
}
