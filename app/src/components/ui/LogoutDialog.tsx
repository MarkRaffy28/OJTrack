import { useState } from "react";

import { useLogout } from "@/store/auth.store";
import { useShowSnackbar } from "@/store/snackbar.store";
import { Dialog } from "./Dialog";

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
    <Dialog.Confirm
      visible={visible}
      item="Logout"
      description="Are you sure you want to log out? You'll need to log in again to access your account."
      actionLabel="Logout"
      destructive
      onCancel={onDismiss}
      onAction={handleLogout}
      loading={isLoading}
    />
  );
}
