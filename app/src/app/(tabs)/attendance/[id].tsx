import { api } from "@/api";
import { Chip } from "@/components/ui/Chip";
import { EmptyPlaceholder } from "@/components/ui/EmptyPlaceholder";
import { SafeView } from "@/components/ui/SafeView";
import { useAuthUser } from "@/store/auth.store";
import { useShowSnackbar } from "@/store/snackbar.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Card, Surface, Text, useTheme } from "react-native-paper";

export default function AttendanceDetailScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const showSnackbar = useShowSnackbar();
  const user = useAuthUser();
  const isSupervisor = user?.role === "supervisor";

  const { id } = useLocalSearchParams<{ id: string }>();
  const attendanceId = Number(id);

  const {
    data: attendance,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["attendance", attendanceId],
    queryFn: () => api.getAttendance(attendanceId),
    enabled: Number.isInteger(attendanceId) && attendanceId > 0,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ slot }: { slot?: string }) => api.approveAttendance(attendanceId, slot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["ojt"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showSnackbar("Attendance verification updated successfully");
    },
    onError: (err) => {
      showSnackbar(getApiErrorMessage(err), "error");
    },
  });

  useEffect(() => {
    if (isError) {
      showSnackbar(getApiErrorMessage(error), "error");
    }
  }, [isError, error, showSnackbar]);

  if (isLoading) {
    return (
      <SafeView>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeView>
    );
  }

  if (isError || !attendance) {
    return (
      <SafeView>
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Attendance Details" />
        </Appbar.Header>
        <EmptyPlaceholder
          title="Attendance record not found"
          description="The requested attendance record could not be loaded."
        />
      </SafeView>
    );
  }

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

  const isAllApproved =
    attendance.morningInVerified &&
    attendance.morningOutVerified &&
    attendance.afternoonInVerified &&
    attendance.afternoonOutVerified;

  const slots = [
    { key: "morning_in", label: "Morning Check In", time: attendance.morningIn, verified: attendance.morningInVerified, type: "morning_in" as const },
    { key: "morning_out", label: "Morning Check Out", time: attendance.morningOut, verified: attendance.morningOutVerified, type: "morning_out" as const },
    { key: "afternoon_in", label: "Afternoon Check In", time: attendance.afternoonIn, verified: attendance.afternoonInVerified, type: "afternoon_in" as const },
    { key: "afternoon_out", label: "Afternoon Check Out", time: attendance.afternoonOut, verified: attendance.afternoonOutVerified, type: "afternoon_out" as const },
  ];

  return (
    <SafeView style={{ backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Attendance Details" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Summary */}
        <Surface elevation={1} style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontWeight: "700" }}>
                {attendance.date}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Total Logged Hours: {attendance.totalHours || 0} hrs
              </Text>
            </View>

            <Chip
              text={isAllApproved ? "All Approved" : "Unapproved / Partial"}
              tone={isAllApproved ? "success" : "warning"}
              variant="filled"
            />
          </View>

          {isSupervisor && (
            <Button
              mode="contained"
              icon="check-all"
              style={{ marginTop: 16 }}
              loading={toggleMutation.isPending}
              buttonColor={isAllApproved ? theme.colors.secondary : theme.colors.primary}
              onPress={() => toggleMutation.mutate({})}
            >
              {isAllApproved ? "Unapprove All 4 Slots" : "Toggle All 4 Slots (Approve All)"}
            </Button>
          )}
        </Surface>

        {/* Sessions Verification Grid */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Time Sessions Verification
        </Text>

        {slots.map((slot) => {
          const status = getSessionStatus(slot.time, slot.type);

          return (
            <Card key={slot.key} style={[styles.slotCard, { backgroundColor: theme.colors.elevation.level1 }]}>
              <Card.Content style={{ gap: 8 }}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                      {slot.label}
                    </Text>
                    <Text variant="bodyLarge" style={{ fontWeight: "600", marginTop: 2 }}>
                      {slot.time || "Not logged"}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Chip text={status.label} tone={status.tone} variant="filled" size="small" />
                    <Chip
                      text={slot.verified ? "Approved ✓" : "Unapproved"}
                      tone={slot.verified ? "success" : "warning"}
                      variant="outlined"
                      size="small"
                    />
                  </View>
                </View>

                {isSupervisor && (
                  <Button
                    mode={slot.verified ? "outlined" : "contained-tonal"}
                    compact
                    style={{ marginTop: 4 }}
                    loading={toggleMutation.isPending}
                    onPress={() => toggleMutation.mutate({ slot: slot.key })}
                  >
                    {slot.verified ? "Mark Unapproved" : "Approve Slot"}
                  </Button>
                )}
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 20,
  },
  slotCard: {
    borderRadius: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "700",
    marginTop: 8,
  },
});
