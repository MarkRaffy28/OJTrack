import { api } from "@/api";
import { SafeView } from "@/components/ui/SafeView";
import { CONTENT_MAX_WIDTH } from "@/constants/responsive.constant";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Icon,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useState } from "react";
import { AppView } from "@/components/ui/AppView";
import { useQueryClient } from "@tanstack/react-query";
import { useRefresh } from "@/hooks/useRefresh";

export function SupervisorDashboardScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard", "supervisor"],
    queryFn: api.getSupervisorDashboardMetrics,
  });

  const { refreshing, refresh } = useRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "supervisor"] });
    },
  });

  if (isLoading) {
    return (
      <SafeView style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeView>
    );
  }

  const supervisor = data?.supervisor;
  const stats = data?.stats;

  return (
    <SafeView style={{ backgroundColor: theme.colors.background }}>
      <AppView>
        <View style={styles.webWrapper}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            }
          >
            {/* Header Card */}
            <Surface
              elevation={2}
              style={[
                styles.headerCard,
                {
                  backgroundColor: theme.colors.primaryContainer,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.headerRow}>
                <View style={styles.headerTextGroup}>
                  <Text
                    variant="labelMedium"
                    style={{
                      color: theme.colors.onPrimaryContainer,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    Supervisor Dashboard
                  </Text>
                  <Text
                    variant="headlineSmall"
                    style={{
                      color: theme.colors.onPrimaryContainer,
                      fontWeight: "700",
                      marginTop: 2,
                    }}
                  >
                    Welcome, {supervisor?.name || "Supervisor"}!
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onPrimaryContainer,
                      opacity: 0.85,
                      marginTop: 4,
                    }}
                  >
                    {supervisor?.position} • {supervisor?.officeName}
                  </Text>
                </View>

                {supervisor?.profilePicture ? (
                  <Avatar.Image
                    size={56}
                    source={{
                      uri: `data:image/jpeg;base64,${supervisor.profilePicture}`,
                    }}
                  />
                ) : (
                  <Avatar.Icon size={56} icon="account-tie" />
                )}
              </View>
            </Surface>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <Surface
                elevation={1}
                style={[
                  styles.statCard,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
              >
                <View
                  style={[
                    styles.statIconBadge,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Icon
                    source="account-group"
                    size={24}
                    color={theme.colors.onPrimaryContainer}
                  />
                </View>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {stats?.totalTrainees ?? 0}
                </Text>
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Total Trainees
                </Text>
              </Surface>

              <Surface
                elevation={1}
                style={[
                  styles.statCard,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
              >
                <View
                  style={[
                    styles.statIconBadge,
                    { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                >
                  <Icon
                    source="account-check"
                    size={24}
                    color={theme.colors.onSecondaryContainer}
                  />
                </View>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {stats?.presentToday ?? 0}
                </Text>
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Present Today
                </Text>
              </Surface>

              <Surface
                elevation={1}
                style={[
                  styles.statCard,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
              >
                <View
                  style={[
                    styles.statIconBadge,
                    { backgroundColor: theme.colors.tertiaryContainer },
                  ]}
                >
                  <Icon
                    source="file-clock-outline"
                    size={24}
                    color={theme.colors.onTertiaryContainer}
                  />
                </View>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {stats?.pendingReports ?? 0}
                </Text>
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Pending Reports
                </Text>
              </Surface>

              <Surface
                elevation={1}
                style={[
                  styles.statCard,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
              >
                <View
                  style={[
                    styles.statIconBadge,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <Icon
                    source="clock-outline"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {stats?.totalRenderedHours ?? 0}
                </Text>
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Rendered Hours
                </Text>
              </Surface>
            </View>

            {/* Action Cards */}
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
            >
              Quick Actions
            </Text>

            <View style={styles.actionsColumn}>
              <Surface
                elevation={1}
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
              >
                <View style={styles.actionRow}>
                  <View
                    style={[
                      styles.actionIconBadge,
                      { backgroundColor: theme.colors.primaryContainer },
                    ]}
                  >
                    <Icon source="qrcode-scan" size={26} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: "600" }}>
                      Attendance Scanner Code
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      Display live QR code for trainees to scan attendance.
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  icon="qrcode"
                  style={{ marginTop: 12 }}
                  onPress={() => router.push("/qr")}
                >
                  Show QR Code
                </Button>
              </Surface>

              <Surface
                elevation={1}
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
              >
                <View style={styles.actionRow}>
                  <View
                    style={[
                      styles.actionIconBadge,
                      { backgroundColor: theme.colors.secondaryContainer },
                    ]}
                  >
                    <Icon
                      source="account-group"
                      size={26}
                      color={theme.colors.secondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: "600" }}>
                      Manage Trainees
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      View assigned trainees, verify attendance & check hours logged.
                    </Text>
                  </View>
                </View>
                <Button
                  mode="outlined"
                  icon="account-search"
                  style={{ marginTop: 12 }}
                  onPress={() => router.push("/trainees")}
                >
                  View Trainees List
                </Button>
              </Surface>

              <Surface
                elevation={1}
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
              >
                <View style={styles.actionRow}>
                  <View
                    style={[
                      styles.actionIconBadge,
                      { backgroundColor: theme.colors.tertiaryContainer },
                    ]}
                  >
                    <Icon
                      source="file-document-check"
                      size={26}
                      color={theme.colors.tertiary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: "600" }}>
                      Review Reports
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      Review, approve or reject pending OJT reports from trainees.
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained-tonal"
                  icon="file-document"
                  style={{ marginTop: 12 }}
                  onPress={() => router.push("/reports")}
                >
                  Review Submitted Reports
                </Button>
              </Surface>
            </View>
          </ScrollView>
        </View>
      </AppView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  headerCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 20,
    padding: 16,
    alignItems: "flex-start",
  },
  statIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontWeight: "700",
    marginBottom: 2,
  },
  sectionTitle: {
    fontWeight: "700",
    marginTop: 8,
  },
  actionsColumn: {
    gap: 12,
  },
  actionCard: {
    borderRadius: 20,
    padding: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  actionIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
