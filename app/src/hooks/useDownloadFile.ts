import { useCallback } from "react";
import { Linking, Platform } from "react-native";
import { useShowSnackbar } from "@/store/snackbar.store";

export function useDownloadFile() {
  const showSnackbar = useShowSnackbar();

  const downloadFile = useCallback(
    async (url: string, filename?: string) => {
      if (!url) {
        showSnackbar("Invalid file URL", "error");
        return;
      }

      try {
        if (Platform.OS === "web") {
          // On Web: Create an invisible anchor tag and trigger click
          const link = document.createElement("a");
          link.href = url;
          if (filename) {
            link.download = filename;
          }
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // On Mobile: Use Linking to open or download the file URL
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            showSnackbar("Cannot open file URL on this device", "error");
          }
        }
      } catch (err) {
        showSnackbar("Failed to download file", "error");
      }
    },
    [showSnackbar],
  );

  return { downloadFile };
}
