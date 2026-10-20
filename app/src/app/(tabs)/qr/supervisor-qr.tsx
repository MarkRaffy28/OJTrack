import { api } from "@/api";
import { SafeView } from "@/components/ui/SafeView";
import { CONTENT_MAX_WIDTH } from "@/constants/responsive.constant";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  ActivityIndicator,
  Icon,
  ProgressBar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import QRCode from "react-native-qrcode-svg";

const QR_INTERVAL = 60;

export default function SupervisorQRScreen() {
  const theme = useTheme();
  const [seconds, setSeconds] = useState(QR_INTERVAL);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "supervisor-qr"],
    queryFn: api.getQrCode,
    refetchInterval: QR_INTERVAL * 1000,
  });

  useEffect(() => {
    if (!data) return;
    setSeconds(QR_INTERVAL);
  }, [data]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev <= 1 ? QR_INTERVAL : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: seconds / QR_INTERVAL,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [seconds, progressAnim]);

  const progress = seconds / QR_INTERVAL;

  return (
    <SafeView
      edges={["top", "left", "right"]}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View style={styles.webWrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.primary, letterSpacing: 1 }}
            >
              ATTENDANCE VERIFICATION
            </Text>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Supervisor Scanner Code
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
            >
              Have trainees scan this code using the OJTrack app to log attendance.
            </Text>
          </View>

          {/* Main Elevated QR Surface */}
          <Surface
            elevation={2}
            style={[
              styles.qrCard,
              {
                backgroundColor: theme.colors.elevation.level2,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.liveBadge,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: theme.colors.onPrimaryContainer },
                  ]}
                />
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: "700",
                  }}
                >
                  AUTO-REFRESHING
                </Text>
              </View>
            </View>

            {/* QR Canvas Wrapper */}
            <View
              style={[
                styles.qrContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}
            >
              {isLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text
                    variant="bodySmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 12,
                    }}
                  >
                    Generating secure token...
                  </Text>
                </View>
              ) : (
                <QRCode
                  value={data?.token || "pending"}
                  size={220}
                  backgroundColor={theme.colors.surface}
                  color={theme.colors.onSurface}
                />
              )}
            </View>

            {/* Refresh Timer & Progress Bar */}
            <View style={styles.timerSection}>
              <View style={styles.timerHeader}>
                <View style={styles.timerIconLabel}>
                  <Icon
                    source="clock-outline"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="labelMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Refreshes in
                  </Text>
                </View>
                <Text
                  variant="labelLarge"
                  style={{ color: theme.colors.primary, fontWeight: "700" }}
                >
                  {seconds}s
                </Text>
              </View>

              <ProgressBar
                progress={progress}
                color={theme.colors.primary}
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
            </View>
          </Surface>

          {/* Office/Location Surface */}
          <Surface
            elevation={1}
            style={[
              styles.officeCard,
              { backgroundColor: theme.colors.elevation.level1 },
            ]}
          >
            <View
              style={[
                styles.officeIconWrapper,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              <Icon
                source="office-building"
                size={20}
                color={theme.colors.onSecondaryContainer}
              />
            </View>

            <View style={styles.officeInfo}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                ASSIGNED OFFICE
              </Text>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface, fontWeight: "600" }}
              >
                {data?.officeName || "Loading Office..."}
              </Text>
            </View>
          </Surface>
        </ScrollView>
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    gap: 6,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
  },
  qrCard: {
    width: "100%",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  badgeRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  qrContainer: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  loadingBox: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  timerSection: {
    width: "100%",
    gap: 8,
  },
  timerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerIconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  officeCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    gap: 16,
  },
  officeIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  officeInfo: {
    flex: 1,
  },
});
