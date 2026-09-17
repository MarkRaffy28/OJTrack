import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Redirect, router } from "expo-router";
import { IconButton, Portal, Surface, Text } from "react-native-paper";

import { Dialog } from "@/components/ui/Dialog";
import { ICON_SIZES } from "@/constants/icons.constants";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useTheme } from "@/store/settings.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useShowSnackbar } from "@/store/snackbar.store";
import { getApiErrorMessage } from "@/utils/api.util";

export default function QRScannerScreen() {
  const theme = useTheme();
  const isDesktop = useIsDesktop();
  const queryClient = useQueryClient();
  const showSnackbar = useShowSnackbar();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);

  const qrAttendanceMutation = useMutation({
    mutationFn: (qrPayload: string) => api.submitQrAttendance({ qrPayload }),
    onSuccess: (attendance) => {
      queryClient.setQueryData(["attendance", "today"], attendance);
      queryClient.invalidateQueries({
        queryKey: ["attendance"],
        refetchType: "none",
      });
    },
  });

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (!scanning || processing) {
        return;
      }

      setScanning(false);
      setProcessing(true);

      try {
        await qrAttendanceMutation.mutateAsync(data);
        showSnackbar("Attendance logged successfully!");
        router.back();
      } catch (error) {
        showSnackbar(getApiErrorMessage(error), "error");

        setScanning(true);
      } finally {
        setProcessing(false);
      }
    },
    [scanning, processing, qrAttendanceMutation, showSnackbar],
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  if (!router.canGoBack()) {
    return <Redirect href="(tabs)/home" />;
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <Portal>
        <Dialog.Confirm
          visible
          title="Camera Permission Required"
          description="Camera permission is required to scan the attendance QR code."
          cancelLabel="Cancel"
          actionLabel="Allow Camera"
          onCancel={handleCancel}
          onAction={requestPermission}
        />
      </Portal>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
      />

      {/* Dark overlay / scanner UI */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={ICON_SIZES.lg}
            iconColor={theme.colors.surface}
            onPress={handleCancel}
          />
        </View>

        {/* Scanner frame */}
        <View style={styles.scannerContainer}>
          <View
            style={[
              styles.scannerFrame,
              {
                borderColor: theme.colors.primary,
              },
            ]}
          />

          <Text
            variant="bodyMedium"
            style={[styles.instruction, { color: theme.colors.surface }]}
          >
            Scan the attendance QR code
          </Text>
        </View>

        {/* Processing */}
        {processing && (
          <Surface
            style={[
              styles.processing,
              {
                backgroundColor: theme.colors.surface,
              },
            ]}
            elevation={3}
          >
            <ActivityIndicator />
            <Text>Processing attendance...</Text>
          </Surface>
        )}

        {/* Desktop hint */}
        {isDesktop && !processing && (
          <Text
            variant="bodySmall"
            style={[styles.desktopHint, { color: theme.colors.surface }]}
          >
            Position the QR code inside the frame
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  header: {
    position: "absolute",
    top: 30,
    left: 0,
    zIndex: 10,
  },

  scannerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  scannerFrame: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderRadius: 24,
  },

  instruction: {
    marginTop: 24,
    textAlign: "center",
  },

  processing: {
    position: "absolute",
    bottom: 48,
    left: 24,
    right: 24,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  desktopHint: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    textAlign: "center",
  },
});
