import { useState } from "react";
import { Dialog, Button, Text } from "react-native-paper";

import { useLogout } from "@/store/auth.store";
import { useShowSnackbar } from "@/store/snackbar.store";

interface LogoutDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

export function LogoutDialog({ visible, onDismiss }: LogoutDialogProps) {
  const logout = useLogout();

  const showSnackbar = useShowSnackbar();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();

      showSnackbar("Logged out successfully");

      onDismiss();
    } catch (error) {
      showSnackbar("Failed to log out. Please try again.", "error");
      setIsLoading(false);
    }
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>Log out</Dialog.Title>

      <Dialog.Content>
        <Text variant="bodyMedium">
          Are you sure you want to log out? You'll need to log in again to access your
          account.
        </Text>
      </Dialog.Content>

      <Dialog.Actions>
        <Button onPress={onDismiss} disabled={isLoading}>
          Cancel
        </Button>

        <Button
          textColor="red"
          loading={isLoading}
          disabled={isLoading}
          onPress={handleLogout}
        >
          Log out
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
