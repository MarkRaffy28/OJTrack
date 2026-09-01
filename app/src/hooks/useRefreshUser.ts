import { useCallback, useState } from "react";

import { api } from "@/api";
import { useUpdateUser } from "@/store/auth.store";
import { useShowSnackbar } from "@/store/snackbar.store";
import { getApiErrorMessage } from "@/utils/api.util";

export const useRefreshUser = () => {
  const showSnackbar = useShowSnackbar();
  const updateUser = useUpdateUser();

  const [refreshing, setRefreshing] = useState(false);

  const refreshUser = useCallback(async () => {
    setRefreshing(true);

    try {
      const { user } = await api.me();

      updateUser(user);
    } catch (error) {
      showSnackbar(getApiErrorMessage(error), "error");
    } finally {
      setRefreshing(false);
    }
  }, [showSnackbar, updateUser]);

  return {
    refreshing,
    refreshUser,
  };
};
