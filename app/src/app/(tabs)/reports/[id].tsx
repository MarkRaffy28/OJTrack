import { api } from "@/api";
import { ReportFields } from "@/components/fields/ReportsFields";
import { AppView } from "@/components/ui/AppView";
import { EmptyPlaceholder } from "@/components/ui/EmptyPlaceholder";
import { SafeView } from "@/components/ui/SafeView";
import { useAppForm } from "@/form/hook";
import {
  FileData,
  Report,
  ReviewReportRequest,
  UpdateReportForm,
  UpdateReportFormSchema,
  UpdateReportRequest,
} from "@/schemas/report.schema";
import { useAuthUser } from "@/store/auth.store";
import { useShowSnackbar } from "@/store/snackbar.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { formatDateOnly } from "@/utils/date.util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Dialog,
  Portal,
  Surface,
  Text,
  TextInput,
  Tooltip,
  useTheme,
} from "react-native-paper";

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reportId = Number(id);

  const theme = useTheme();
  const queryClient = useQueryClient();
  const showSnackbar = useShowSnackbar();
  const user = useAuthUser();
  const isSupervisor = user?.role === "supervisor";

  const [isEditing, setIsEditing] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const defaultValues: UpdateReportForm = {
    id: reportId || 0,
    type: "daily",
    reportDate: formatDateOnly(new Date()),
    documents: [],
    status: "pending",
    feedback: "",
    reviewedBy: null,
    reviewedAt: null,
  };

  const {
    data: report,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => api.getReport(reportId),
    enabled: Number.isInteger(reportId) && reportId > 0,
  });

  const mutation = useMutation({
    mutationFn: ({ reportId, data }: { reportId: number; data: UpdateReportRequest }) =>
      api.updateReport(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });

      setIsEditing(false);
      showSnackbar("Report updated successfully");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (data: ReviewReportRequest) => api.reviewReport(reportId, data),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showSnackbar(`Report ${updatedReport.status} successfully`);
    },
    onError: (err) => {
      showSnackbar(getApiErrorMessage(err), "error");
    },
  });

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: UpdateReportFormSchema,
      onChange: UpdateReportFormSchema,
      onSubmit: UpdateReportFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const formData = new FormData();

        formData.append("type", value.type);
        formData.append("reportDate", value.reportDate);

        if (value.status) formData.append("status", value.status);
        if (value.feedback) formData.append("feedback", value.feedback);

        if (value.documents && Array.isArray(value.documents)) {
          for (const file of value.documents) {
            const fileUri = file.uri || file.url || file.path;
            if (!fileUri) continue;

            if (Platform.OS === "web") {
              if (fileUri.startsWith("blob:") || fileUri.startsWith("data:")) {
                const res = await fetch(fileUri);
                const blob = await res.blob();
                formData.append("documents[]", blob, file.name);
              } else {
                formData.append("existing_documents[]", fileUri);
              }
            } else {
              formData.append("documents[]", {
                uri: fileUri,
                name: file.name,
                type: file.type || file.mimeType || "application/octet-stream",
              } as any);
            }
          }
        }

        await mutation.mutateAsync({ reportId: value.id, data: formData });
      } catch (err) {
        form.setErrorMap({ onSubmit: getApiErrorMessage(err) });
      }
    },
  });

  const resetFormFromReport = (report: Report) => {
    if (!report) return;

    const normalizedDocs: FileData[] = (report.documents || []).map((doc) => ({
      name: doc.name || "Document",
      uri: doc.uri || doc.url || doc.path || "",
      url: doc.url,
      path: doc.path,
      type: doc.type || doc.mimeType,
    }));

    let reviewedByLabel = report.reviewedBy ?? null;
    if (user && report.reviewedBy) {
      const myFullName = user.fullName || `${user.firstName} ${user.lastName}`.trim();
      if (
        report.reviewedBy === myFullName ||
        report.reviewedBy === user.username ||
        report.reviewedBy === (user as any).email
      ) {
        reviewedByLabel = "You";
      }
    }
    if (isSupervisor && report.status !== "pending" && (!reviewedByLabel || reviewedByLabel === user?.fullName)) {
      reviewedByLabel = "You";
    }

    form.reset(
      {
        id: report.id,
        type: report.type,
        reportDate: report.reportDate,
        status: report.status,
        feedback: report.feedback || "",
        reviewedBy: reviewedByLabel,
        reviewedAt: report.reviewedAt ?? null,
        documents: normalizedDocs,
      } as UpdateReportForm,
      { keepDefaultValues: true },
    );
  };

  useEffect(() => {
    resetFormFromReport(report as any);
    if (report) {
      setFeedbackText(report.feedback || "");
    }
  }, [report]);

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  if (isError || !report) {
    return (
      <SafeView>
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Report Details" />
        </Appbar.Header>
        <EmptyPlaceholder
          title="No report record found"
          description="The report record you are looking for does not exist."
        />
      </SafeView>
    );
  }

  return (
    <SafeView>
      <form.AppForm>
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Report Details" />

          {!isSupervisor && (
            isEditing ? (
              <>
                <Tooltip title="Cancel">
                  <Appbar.Action
                    icon="close"
                    onPress={() => {
                      resetFormFromReport(report);
                      setIsEditing(false);
                    }}
                  />
                </Tooltip>
                <Tooltip title="Save Changes">
                  <Appbar.Action
                    icon="check"
                    onPress={() => void form.handleSubmit()}
                    disabled={mutation.isPending}
                  />
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Edit">
                <Appbar.Action
                  icon="pencil"
                  onPress={() => {
                    setIsEditing(true);
                  }}
                />
              </Tooltip>
            )
          )}
        </Appbar.Header>

        <ScrollView showsVerticalScrollIndicator={false}>
          <AppView>
            {/* Trainee Info Header Card for Supervisors */}
            {isSupervisor && report.student && (
              <Surface
                elevation={1}
                style={[
                  styles.studentCard,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
              >
                <View style={styles.studentRow}>
                  {report.student.profilePicture ? (
                    <Avatar.Image
                      size={48}
                      source={{ uri: `data:image/jpeg;base64,${report.student.profilePicture}` }}
                    />
                  ) : (
                    <Avatar.Icon size={48} icon="account" />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                      {report.student.fullName}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {report.student.email}
                    </Text>
                  </View>
                </View>
              </Surface>
            )}

            <ReportFields
              form={form}
              fields={
                isSupervisor
                  ? ["type", "reportDate", "documents", "status", "reviewedBy", "reviewedAt"]
                  : undefined
              }
              readOnlyFields={["status", "reviewedBy", "reviewedAt", "feedback"]}
              editable={!isSupervisor && isEditing}
            />

            {/* Direct Inline Supervisor Feedback Card */}
            {isSupervisor && (
              <Card
                style={[
                  styles.feedbackCard,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
              >
                <Card.Content style={{ gap: 12 }}>
                  <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                    Supervisor Feedback
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="Feedback Notes"
                    placeholder="Type feedback or comments for trainee..."
                    multiline
                    numberOfLines={3}
                    value={feedbackText}
                    onChangeText={setFeedbackText}
                    style={{ backgroundColor: theme.colors.surface }}
                  />
                  {report.status !== "pending" && (
                    <Button
                      mode="contained"
                      icon="content-save-outline"
                      loading={reviewMutation.isPending}
                      onPress={() =>
                        reviewMutation.mutate({
                          status: report.status as any,
                          feedback: feedbackText.trim() || undefined,
                        })
                      }
                      style={{ alignSelf: "flex-end" }}
                    >
                      Save Feedback
                    </Button>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Supervisor Action Bar */}
            {isSupervisor && report.status === "pending" && (
              <View style={styles.supervisorActions}>
                <Button
                  mode="contained"
                  buttonColor={theme.colors.primary}
                  icon="check-circle"
                  style={{ flex: 1 }}
                  loading={reviewMutation.isPending}
                  onPress={() =>
                    reviewMutation.mutate({
                      status: "approved",
                      feedback: feedbackText.trim() || undefined,
                    })
                  }
                >
                  Approve Report
                </Button>
                <Button
                  mode="contained"
                  buttonColor={theme.colors.error}
                  icon="close-circle"
                  style={{ flex: 1 }}
                  loading={reviewMutation.isPending}
                  onPress={() =>
                    reviewMutation.mutate({
                      status: "rejected",
                      feedback: feedbackText.trim() || undefined,
                    })
                  }
                >
                  Reject Report
                </Button>
              </View>
            )}

            <form.ErrorMessage />
          </AppView>
        </ScrollView>
      </form.AppForm>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  studentCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  feedbackCard: {
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 16,
  },
  supervisorActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
  },
});
