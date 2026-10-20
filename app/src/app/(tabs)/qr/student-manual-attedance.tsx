import { api } from "@/api";
import { AttendanceFields } from "@/components/fields/AttendanceFields";
import { AppView } from "@/components/ui/AppView";
import { SafeView } from "@/components/ui/SafeView";
import { useAppForm } from "@/form/hook";
import { useRefresh } from "@/hooks/useRefresh";
import { ManualAttendanceRequest } from "@/schemas/attendance.schema";
import { getApiErrorMessage } from "@/utils/api.util";
import { formatNamedDate } from "@/utils/date.util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Surface, Text, useTheme } from "react-native-paper";

export default function StudentManualAttendanceScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data: attendance, isLoading, refetch } = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: api.getTodayAttendance,
  });

  const { refreshing, refresh } = useRefresh({
    onRefresh: async () => {
      await refetch();
    },
  });

  const mutation = useMutation({
    mutationFn: api.submitManualAttendance,
    onSuccess: (savedAttendance) => {
      queryClient.setQueryData(["attendance", "today"], savedAttendance);
      queryClient.invalidateQueries({
        queryKey: ["attendance"],
        refetchType: "none",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      id: 0,
      morningIn: undefined,
      morningInVerified: false,
      morningOut: undefined,
      morningOutVerified: false,
      afternoonIn: undefined,
      afternoonInVerified: false,
      afternoonOut: undefined,
      afternoonOutVerified: false,
    } as ManualAttendanceRequest,
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
      }
    },
  });

  useEffect(() => {
    if (!attendance) return;

    form.setFieldValue("id", attendance.id);
    form.setFieldValue("morningIn", attendance.morningIn ?? undefined);
    form.setFieldValue("morningInVerified", attendance.morningInVerified);
    form.setFieldValue("morningOut", attendance.morningOut ?? undefined);
    form.setFieldValue("morningOutVerified", attendance.morningOutVerified);
    form.setFieldValue("afternoonIn", attendance.afternoonIn ?? undefined);
    form.setFieldValue("afternoonInVerified", attendance.afternoonInVerified);
    form.setFieldValue("afternoonOut", attendance.afternoonOut ?? undefined);
    form.setFieldValue("afternoonOutVerified", attendance.afternoonOutVerified);
  }, [attendance]);

  const loggedCount = [
    attendance?.morningIn,
    attendance?.morningOut,
    attendance?.afternoonIn,
    attendance?.afternoonOut,
  ].filter(Boolean).length;

  return (
    <SafeView>
      <ScrollView showsVerticalScrollIndicator={false}  
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      >
        <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerDate, { color: theme.colors.onPrimaryContainer }]}>
              {formatNamedDate(new Date())}
            </Text>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.badgeText, { color: theme.colors.onPrimary }]}>
                {loggedCount}/4 logged
              </Text>
            </View>
          </View>
        </View>

        <AppView>
          <View style={styles.qrButton}>
            <Button
              mode="outlined"
              onPress={() => router.push("/qr/scanner")}
              icon="qrcode"
            >
              Scan QR Code
            </Button>
          </View>

          <form.AppForm>
            {/* Morning section */}
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>
              Morning
            </Text>
            <AttendanceFields
              form={form}
              fields={["morningIn", "morningOut"]}
              editable={false}
            />

            {/* Afternoon section */}
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>
              Afternoon
            </Text>
            <AttendanceFields
              form={form}
              fields={["afternoonIn", "afternoonOut"]}
              editable={false}
            />

            <form.ErrorMessage />

            <form.Submit
              submitLabel="Log Attendance"
              submittingLabel="Logging..."
              allowSubmitWithoutChanges
              style={{ marginTop: 20 }}
            />
          </form.AppForm>
        </AppView>
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerDate: {
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  qrButton: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 4,
    textTransform: "capitalize",
  },
});
