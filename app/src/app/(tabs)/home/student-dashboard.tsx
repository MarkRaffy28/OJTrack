import { api } from "@/api";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { SafeView } from "@/components/ui/SafeView";
import { useRefresh } from "@/hooks/useRefresh";
import { StudentDashboardSchema } from "@/schemas/dashboard.schema";
import { formatDay, formatRelativeDate, getGreeting } from "@/utils/date.util";
import { getInitials } from "@/utils/string.util";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Divider,
  Icon,
  IconButton,
  List,
  ProgressBar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { z } from "zod";

type StudentDashboardData = z.infer<typeof StudentDashboardSchema>;

export function StudentDashboardScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Dashboard Overview Metrics Query
  const { data, isLoading: isMetricsLoading, refetch: refetchMetrics } = useQuery<StudentDashboardData>({
    queryKey: ["dashboard", "student"],
    queryFn: api.getStudentDashboardMetrics,
  });
  
  const { refreshing, refresh } = useRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "student"] });
      await queryClient.invalidateQueries({ queryKey: ["attendance", "recent"] });
    },
  });

  // Recent Attendance Logs Query
  const { data: attendance, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ["attendance", "recent"],
    queryFn: async () => {
      const history = await api.getAttendanceHistory();
      return history?.slice(0, 3) || [];
    },
  });

  const student = data?.student;
  const ojt = data?.ojt;
  const reports = data?.reports;
  const progressRatio = ojt?.progress ?? 0;

  return (
    <SafeView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {/* 1. Header Section: Profile & Dynamic Greeting */}
        <View style={styles.profileHeader}>
          <View style={styles.greetingGroup}>
            <Text
              variant="labelMedium"
              style={{ color: theme.colors.primary, letterSpacing: 0.8 }}
            >
              {getGreeting().toUpperCase()}
            </Text>
            <Text
              variant="headlineSmall"
              style={[styles.studentName, { color: theme.colors.onBackground }]}
            >
              {student?.name || "Student Trainee"}
            </Text>
            {ojt?.officeName && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Assigned to: {ojt.officeName}
              </Text>
            )}
          </View>

          <Avatar
            source={student?.profilePicture}
            text={getInitials(student?.name ?? "")}
            mode="view"
            variant="medium"
          />
        </View>

        {/* 2. Quick Action Banner */}
        <Surface
          elevation={0}
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.primaryContainer,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.heroBody}>
            <View style={styles.heroTextGroup}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: theme.colors.onPrimaryContainer },
                  ]}
                />
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: "700",
                    letterSpacing: 0.8,
                  }}
                >
                  QUICK ACTION
                </Text>
              </View>

              <Text
                variant="headlineSmall"
                style={[styles.heroTitle, { color: theme.colors.onPrimaryContainer }]}
              >
                Time Tracking
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.onPrimaryContainer,
                  opacity: 0.85,
                }}
              >
                Scan supervisor QR code to verify and log daily shift attendance.
              </Text>
            </View>

            <View style={[styles.heroIconBadge, { backgroundColor: theme.colors.surface }]}>
              <Icon source="qrcode-scan" size={28} color={theme.colors.primary} />
            </View>
          </View>

          <Button
            mode="contained"
            icon="camera"
            buttonColor={theme.colors.onPrimaryContainer}
            textColor={theme.colors.primaryContainer}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            onPress={() => router.push("/qr/scanner")}
          >
            Scan Attendance QR
          </Button>
        </Surface>

        {/* 3. OJT Hours Progress Surface */}
        <Surface
          elevation={1}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.elevation.level1,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleGroup}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
              >
                <Icon
                  source="clock-outline"
                  size={18}
                  color={theme.colors.onSecondaryContainer}
                />
              </View>
              <Text
                variant="titleMedium"
                style={[styles.cardTitle, { color: theme.colors.onSurface }]}
              >
                Progress Overview
              </Text>
            </View>
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.primary, fontWeight: "700" }}
            >
              {Math.round(progressRatio * 100)}%
            </Text>
          </View>

          {isMetricsLoading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <View style={styles.progressBody}>
              <ProgressBar
                progress={progressRatio}
                color={theme.colors.primary}
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />

              {/* Stat Counter Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statCell}>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    COMPLETED
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={[styles.statValue, { color: theme.colors.onSurface }]}
                  >
                    {ojt?.completedHours ?? 0}{" "}
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      hrs
                    </Text>
                  </Text>
                </View>

                <Divider style={styles.verticalDivider} />

                <View style={styles.statCell}>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    REMAINING
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={[styles.statValue, { color: theme.colors.onSurface }]}
                  >
                    {ojt?.remainingHours ?? 0}{" "}
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      hrs
                    </Text>
                  </Text>
                </View>

                <Divider style={styles.verticalDivider} />

                <View style={styles.statCell}>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    REQUIRED
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={[styles.statValue, { color: theme.colors.onSurface }]}
                  >
                    {ojt?.requiredHours ?? 0}{" "}
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      hrs
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Surface>

        {/* 4. Report Submission Summary Row */}
        <Surface
          elevation={1}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.elevation.level1,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleGroup}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
              >
                <Icon
                  source="file-document-outline"
                  size={18}
                  color={theme.colors.onSecondaryContainer}
                />
              </View>
              <Text
                variant="titleMedium"
                style={[styles.cardTitle, { color: theme.colors.onSurface }]}
              >
                Reports Tracker
              </Text>
            </View>

            <Button
              compact
              mode="text"
              labelStyle={{ fontWeight: "700" }}
              onPress={() => router.push("/reports")}
            >
              Manage
            </Button>
          </View>

          <Divider />

          <View style={styles.reportsGrid}>
            <View style={styles.reportItem}>
              <Text
                variant="titleLarge"
                style={[styles.reportCount, { color: theme.colors.primary }]}
              >
                {reports?.submitted ?? 0}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Submitted
              </Text>
            </View>

            <Divider style={styles.verticalDivider} />

            <View style={styles.reportItem}>
              <Text
                variant="titleLarge"
                style={[styles.reportCount, { color: theme.colors.secondary }]}
              >
                {reports?.approved ?? 0}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Approved
              </Text>
            </View>

            <Divider style={styles.verticalDivider} />

            <View style={styles.reportItem}>
              <Text
                variant="titleLarge"
                style={[styles.reportCount, { color: theme.colors.error }]}
              >
                {reports?.rejected ?? 0}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Rejected
              </Text>
            </View>
          </View>
        </Surface>

        {/* 5. Recent Attendance Logs */}
        <Surface
          elevation={1}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.elevation.level1,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleGroup}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
              >
                <Icon
                  source="history"
                  size={18}
                  color={theme.colors.onSecondaryContainer}
                />
              </View>
              <Text
                variant="titleMedium"
                style={[styles.cardTitle, { color: theme.colors.onSurface }]}
              >
                Recent Logs
              </Text>
            </View>

            <Button
              compact
              mode="text"
              labelStyle={{ fontWeight: "700" }}
              onPress={() => router.push("/attendance")}
            >
              View All
            </Button>
          </View>

          <Divider />

          {isAttendanceLoading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : !attendance || attendance.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                No attendance logs registered yet.
              </Text>
            </View>
          ) : (
            <View>
              {attendance.map((item, index) => (
                <View key={item.id}>
                  <List.Item
                    title={formatRelativeDate(new Date(item.date))}
                    titleStyle={[styles.listTitle, { color: theme.colors.onSurface }]}
                    description={`Logged ${item.totalHours} hours`}
                    descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    left={() => (
                      <View style={styles.chipWrapper}>
                        <Chip
                          text={formatDay(new Date(item.date))}
                          variant="filled"
                          tone="neutral"
                          size="small"
                        />
                      </View>
                    )}
                    right={(props) => (
                      <IconButton
                        {...props}
                        icon="chevron-right"
                        size={20}
                        iconColor={theme.colors.onSurfaceVariant}
                      />
                    )}
                    onPress={() =>
                      router.push({
                        pathname: "/attendance/[id]",
                        params: { id: item.id },
                      })
                    }
                  />
                  {index < attendance.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          )}
        </Surface>
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 12,
    paddingBottom: 40,
    gap: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  greetingGroup: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
  studentName: {
    fontWeight: "700",
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  heroBody: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  heroTextGroup: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroTitle: {
    fontWeight: "700",
  },
  heroIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    borderRadius: 14,
  },
  actionButtonContent: {
    height: 48,
  },
  actionButtonLabel: {
    fontWeight: "700",
    fontSize: 14,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardHeaderTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontWeight: "700",
  },
  progressBody: {
    padding: 16,
    gap: 16,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontWeight: "700",
  },
  reportsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  reportItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  reportCount: {
    fontWeight: "700",
  },
  verticalDivider: {
    height: 28,
    width: 1,
  },
  chipWrapper: {
    justifyContent: "center",
    paddingLeft: 12,
  },
  listTitle: {
    fontWeight: "600",
  },
  loaderBox: {
    padding: 24,
    alignItems: "center",
  },
  emptyBox: {
    padding: 24,
    alignItems: "center",
  },
});
