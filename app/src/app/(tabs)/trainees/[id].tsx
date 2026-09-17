import { api } from "@/api";
import { Chip } from "@/components/ui/Chip";
import { EmptyPlaceholder } from "@/components/ui/EmptyPlaceholder";
import { SafeView } from "@/components/ui/SafeView";
import { CONTENT_MAX_WIDTH } from "@/constants/responsive.constant";
import { AttendanceHistoryItem } from "@/schemas/attendance.schema";
import { Report } from "@/schemas/report.schema";
import { useShowSnackbar } from "@/store/snackbar.store";
import { capitalize } from "@/utils/string.util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  Card,
  Divider,
  Icon,
  List,
  ProgressBar,
  SegmentedButtons,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

export default function TraineeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ojtId = Number(id);

  const theme = useTheme();
  const showSnackbar = useShowSnackbar();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"overview" | "attendance" | "reports">("overview");

  // Fetch OJT detail
  const {
    data: ojt,
    isLoading: isLoadingOJT,
    isError: isErrorOJT,
  } = useQuery({
    queryKey: ["ojt", ojtId],
    queryFn: () => api.getOJTById(ojtId),
    enabled: Number.isInteger(ojtId) && ojtId > 0,
  });

  const studentId = ojt?.student?.id;

  // Fetch trainee attendance history
  const { data: attendanceHistory, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", "trainee", studentId],
    queryFn: () => api.getTraineeAttendanceHistory(studentId),
    enabled: !!studentId,
  });

  // Fetch reports for supervisor
  const { data: allReports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["reports"],
    queryFn: api.getReports,
  });

  const { data: evaluationAccess } = useQuery({
    queryKey: ["evaluation", ojtId],
    queryFn: () => api.getEvaluation(ojtId),
    enabled: Number.isInteger(ojtId) && ojtId > 0,
  });

  const traineeReports = (allReports || []).filter(
    (r) => r.ojtId === ojtId || (studentId && r.studentId === studentId),
  );

  // Approve attendance mutation
  const approveAttendanceMutation = useMutation({
    mutationFn: (attendanceId: number) => api.approveAttendance(attendanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["ojt"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showSnackbar("Attendance approved successfully");
    },
    onError: () => {
      showSnackbar("Failed to approve attendance", "error");
    },
  });

  if (isLoadingOJT) {
    return (
      <SafeView style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.centeredFill}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeView>
    );
  }

  if (isErrorOJT || !ojt) {
    return (
      <SafeView style={{ backgroundColor: theme.colors.background }}>
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Trainee Details" />
        </Appbar.Header>
        <EmptyPlaceholder
          title="Trainee record not found"
          description="The requested OJT record could not be found."
        />
      </SafeView>
    );
  }

  const required = ojt.requiredHours || 1;
  const rendered = ojt.renderedHours || 0;
  const remaining = Math.max(0, required - rendered);
  const progress = Math.min(1, Math.max(0, rendered / required));

  const getSessionStatus = (
    time: string | null | undefined,
    type: "morning_in" | "morning_out" | "afternoon_in" | "afternoon_out"
  ): { label: string; tone: "error" | "warning" | "success" } => {
    if (!time) {
      return { label: "Absent", tone: "error" };
    }

    const cleanTime = time.substring(0, 5);

    switch (type) {
      case "morning_in":
        return cleanTime > "08:00"
          ? { label: "Late", tone: "warning" }
          : { label: "On Time", tone: "success" };
      case "morning_out":
        return cleanTime < "12:00"
          ? { label: "Early Out", tone: "warning" }
          : { label: "On Time", tone: "success" };
      case "afternoon_in":
        return cleanTime > "13:00"
          ? { label: "Late", tone: "warning" }
          : { label: "On Time", tone: "success" };
      case "afternoon_out":
        return cleanTime < "17:00"
          ? { label: "Early Out", tone: "warning" }
          : { label: "On Time", tone: "success" };
    }
  };

  return (
    <SafeView style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.webWrapper}>
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Trainee Profile" titleStyle={{ fontWeight: "700" }} />
        </Appbar.Header>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Student Header Surface */}
          <Surface
            elevation={1}
            style={[styles.headerCard, { backgroundColor: theme.colors.elevation.level1 }]}
          >
            <View style={styles.studentHeaderRow}>
              {ojt.student?.profilePicture ? (
                <Avatar.Image
                  size={64}
                  source={{ uri: `data:image/jpeg;base64,${ojt.student.profilePicture}` }}
                />
              ) : (
                <Avatar.Icon size={64} icon="account" />
              )}

              <View style={{ flex: 1 }}>
                <Text variant="headlineSmall" style={{ fontWeight: "700" }}>
                  {ojt.student?.fullName}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Student ID: {ojt.student?.userId || "N/A"}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 2 }}>
                  {ojt.office?.name || "Assigned Office"}
                </Text>
              </View>

              <Chip
                text={capitalize(ojt.status)}
                tone={ojt.status === "completed" ? "success" : "info"}
                variant="filled"
              />
            </View>

            <Divider style={{ marginVertical: 16 }} />

            {/* OJT Hours Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCol}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  REQUIRED
                </Text>
                <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                  {required} hrs
                </Text>
              </View>

              <View style={styles.metricCol}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  RENDERED
                </Text>
                <Text variant="titleMedium" style={{ fontWeight: "700", color: theme.colors.primary }}>
                  {rendered} hrs
                </Text>
              </View>

              <View style={styles.metricCol}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  REMAINING
                </Text>
                <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                  {remaining} hrs
                </Text>
              </View>
            </View>

            <ProgressBar
              progress={progress}
              color={theme.colors.primary}
              style={styles.progressBar}
            />

            {evaluationAccess?.eligible && evaluationAccess.canEdit && (
              <Button
                mode="contained"
                icon="clipboard-check-outline"
                style={{ marginTop: 16 }}
                onPress={() =>
                  router.push({ pathname: "/evaluations/[id]", params: { id: ojtId } })
                }
              >
                {evaluationAccess.evaluation ? "Continue Evaluation" : "Evaluate Trainee"}
              </Button>
            )}
          </Surface>

          {/* Tab Switcher */}
          <SegmentedButtons
            value={tab}
            onValueChange={(val) => setTab(val as any)}
            buttons={[
              { value: "overview", label: "Overview", icon: "information-outline" },
              { value: "attendance", label: "Attendance", icon: "calendar-check" },
              { value: "reports", label: "Reports", icon: "file-document-outline" },
            ]}
            style={styles.tabs}
          />

          {/* TAB 1: OVERVIEW */}
          {tab === "overview" && (
            <View style={styles.tabSection}>
              <Surface
                elevation={1}
                style={[styles.infoCard, { backgroundColor: theme.colors.elevation.level1 }]}
              >
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Academic Information
                </Text>
                <Divider style={{ marginVertical: 8 }} />
                <View style={styles.infoRow}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>Academic Year:</Text>
                  <Text style={{ fontWeight: "600" }}>{ojt.academicYear}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>Term:</Text>
                  <Text style={{ fontWeight: "600" }}>{ojt.term} Term</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>Start Date:</Text>
                  <Text style={{ fontWeight: "600" }}>{ojt.startDate || "Not set"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>End Date:</Text>
                  <Text style={{ fontWeight: "600" }}>{ojt.endDate || "Not set"}</Text>
                </View>
              </Surface>
            </View>
          )}

          {/* TAB 2: ATTENDANCE */}
          {tab === "attendance" && (
            <View style={styles.tabSection}>
              {isLoadingAttendance ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : !attendanceHistory || attendanceHistory.length === 0 ? (
                <EmptyPlaceholder
                  title="No attendance records"
                  description="This trainee has not logged any attendance entries yet."
                />
              ) : (
                attendanceHistory.map((item: AttendanceHistoryItem) => {
                  const hasUnverified =
                    !item.morningInVerified ||
                    !item.morningOutVerified ||
                    !item.afternoonInVerified ||
                    !item.afternoonOutVerified;

                  const mInStatus = getSessionStatus(item.morningIn, "morning_in");
                  const mOutStatus = getSessionStatus(item.morningOut, "morning_out");
                  const aInStatus = getSessionStatus(item.afternoonIn, "afternoon_in");
                  const aOutStatus = getSessionStatus(item.afternoonOut, "afternoon_out");

                  return (
                    <Card
                      key={item.id}
                      style={[
                        styles.attendanceCard,
                        { backgroundColor: theme.colors.elevation.level1 },
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/attendance/[id]",
                          params: { id: item.id },
                        })
                      }
                    >
                      <Card.Content style={{ gap: 8 }}>
                        <View style={styles.attendanceHeader}>
                          <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                              {item.date}
                            </Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                              Total Hours: {item.totalHours || 0} hrs &bull; Tap for details & toggles
                            </Text>
                          </View>

                          <Chip
                            text={hasUnverified ? "Unverified" : "Verified"}
                            tone={hasUnverified ? "warning" : "success"}
                            variant="filled"
                            size="small"
                          />
                        </View>

                        <Divider style={{ marginVertical: 4 }} />

                        <View style={styles.timeSlotsGrid}>
                          {/* Morning In */}
                          <View style={styles.timeSlot}>
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                              Morning In
                            </Text>
                            <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                              {item.morningIn || "--:--"} {item.morningInVerified ? "✓" : ""}
                            </Text>
                            <Chip text={mInStatus.label} tone={mInStatus.tone} variant="outlined" size="small" />
                          </View>

                          {/* Morning Out */}
                          <View style={styles.timeSlot}>
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                              Morning Out
                            </Text>
                            <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                              {item.morningOut || "--:--"} {item.morningOutVerified ? "✓" : ""}
                            </Text>
                            <Chip text={mOutStatus.label} tone={mOutStatus.tone} variant="outlined" size="small" />
                          </View>

                          {/* Afternoon In */}
                          <View style={styles.timeSlot}>
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                              Afternoon In
                            </Text>
                            <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                              {item.afternoonIn || "--:--"} {item.afternoonInVerified ? "✓" : ""}
                            </Text>
                            <Chip text={aInStatus.label} tone={aInStatus.tone} variant="outlined" size="small" />
                          </View>

                          {/* Afternoon Out */}
                          <View style={styles.timeSlot}>
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                              Afternoon Out
                            </Text>
                            <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                              {item.afternoonOut || "--:--"} {item.afternoonOutVerified ? "✓" : ""}
                            </Text>
                            <Chip text={aOutStatus.label} tone={aOutStatus.tone} variant="outlined" size="small" />
                          </View>
                        </View>

                        {hasUnverified && (
                          <Button
                            mode="contained-tonal"
                            icon="check-decagram"
                            compact
                            style={{ marginTop: 8 }}
                            loading={approveAttendanceMutation.isPending}
                            onPress={(e) => {
                              e.stopPropagation();
                              approveAttendanceMutation.mutate(item.id);
                            }}
                          >
                            Toggle / Approve All 4
                          </Button>
                        )}
                      </Card.Content>
                    </Card>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 3: REPORTS */}
          {tab === "reports" && (
            <View style={styles.tabSection}>
              {isLoadingReports ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : traineeReports.length === 0 ? (
                <EmptyPlaceholder
                  title="No reports submitted"
                  description="This trainee has not submitted any reports yet."
                />
              ) : (
                traineeReports.map((report: Report) => (
                  <List.Item
                    key={report.id}
                    title={capitalize(report.type ?? "Report")}
                    description={`Date: ${report.reportDate}`}
                    left={(props) => (
                      <View style={{ justifyContent: "center", paddingLeft: 8 }}>
                        <Chip
                          text={capitalize(report.status)}
                          tone={
                            report.status === "approved"
                              ? "success"
                              : report.status === "rejected"
                              ? "error"
                              : "warning"
                          }
                          variant="filled"
                          size="small"
                        />
                      </View>
                    )}
                    right={(props) => (
                      <Button
                        compact
                        mode="outlined"
                        onPress={() =>
                          router.push({
                            pathname: "/reports/[id]",
                            params: { id: report.id },
                          })
                        }
                      >
                        Review
                      </Button>
                    )}
                    style={[
                      styles.reportItem,
                      { backgroundColor: theme.colors.elevation.level1 },
                    ]}
                  />
                ))
              )}
            </View>
          )}
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
  centeredFill: {
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
  },
  studentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricCol: {
    alignItems: "center",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  tabs: {
    marginVertical: 4,
  },
  tabSection: {
    gap: 12,
  },
  infoCard: {
    borderRadius: 20,
    padding: 16,
  },
  cardTitle: {
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  attendanceCard: {
    borderRadius: 20,
    padding: 16,
  },
  attendanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
  },
  timeSlot: {
    width: "50%",
  },
  reportItem: {
    borderRadius: 16,
    marginBottom: 8,
  },
});
