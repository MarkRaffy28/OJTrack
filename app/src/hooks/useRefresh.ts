import { useCallback, useState } from "react";

import { useShowSnackbar } from "@/store/snackbar.store";
import { getApiErrorMessage } from "@/utils/api.util";

type UseRefreshProps = {
  onRefresh: () => Promise<void>;
};

export const useRefresh = ({ onRefresh }: UseRefreshProps) => {
  const showSnackbar = useShowSnackbar();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await onRefresh();
    } catch (error) {
      showSnackbar(getApiErrorMessage(error), "error");
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshing, showSnackbar]);

  return {
    refreshing,
    refresh,
  };
};
