import { api } from "@/api";
import { ReportFields } from "@/components/fields/ReportsFields";
import { AppView } from "@/components/ui/AppView";
import { SafeView } from "@/components/ui/SafeView";
import { useAppForm } from "@/form/hook";
import { CreateReportForm, CreateReportFormSchema } from "@/schemas/report.schema";
import { useShowSnackbar } from "@/store/snackbar.store";
import { useReportTemplates } from "@/store/settings.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Card, Icon, Text, useTheme } from "react-native-paper";
import * as Linking from "expo-linking";
import { formatNamedDate } from "@/utils/date.util";

export default function NewReportScreen() {
  const showSnackbar = useShowSnackbar();
  const templates = useReportTemplates();
  const theme = useTheme();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({ queryKey: ["report-assignments"], queryFn: api.getReportAssignments });
  const availableAssignments = assignments.filter((assignment) => !assignment.submitted);
  const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId);

  const mutation = useMutation({
    mutationFn: api.createReport,
    onSuccess: () => { showSnackbar("Report created successfully"); router.back(); },
  });

  const form = useAppForm({
    defaultValues: { reportAssignmentId: 0, documents: [] } as CreateReportForm,
    validators: { onMount: CreateReportFormSchema, onChange: CreateReportFormSchema, onSubmit: CreateReportFormSchema },
    onSubmit: async ({ value }) => {
      try {
        const formData = new FormData();
        formData.append("reportAssignmentId", String(value.reportAssignmentId));
        if (value.reportDate) formData.append("reportDate", value.reportDate);
        for (const file of value.documents) {
          if (!file.uri) throw new Error("Document file is required");
          if (Platform.OS === "web") {
            const res = await fetch(file.uri);
            const blob = await res.blob();
            formData.append("documents[]", blob, file.name);
          } else {
            formData.append("documents[]", { uri: file.uri, name: file.name, type: file.type || "application/octet-stream" } as any);
          }
        }
        await mutation.mutateAsync(formData);
      } catch (error) { form.setErrorMap({ onSubmit: getApiErrorMessage(error) }); }
    },
  });

  return (
    <SafeView>
      <Appbar.Header elevated statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={step === 1 ? "Select Assignment" : "Upload Files"} />
      </Appbar.Header>
      <ScrollView>
        <AppView>
          <form.AppForm>
            <View style={styles.stepHeader}>
              <Text variant="labelLarge" style={{ color: theme.colors.primary }}>Step {step} of 2</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {step === 1 ? "Choose the report assignment you want to submit." : "Attach your report documents to finish."}
              </Text>
            </View>
            {step === 1 ? (
              <>
                {assignmentsLoading ? <ActivityIndicator /> : availableAssignments.length === 0 ? (
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>There are no report assignments available.</Text>
                ) : (
                  <View style={styles.assignmentList}>
                    {availableAssignments.map((assignment) => {
                      const selected = selectedAssignmentId === assignment.id;
                      return (
                        <Pressable key={assignment.id} onPress={() => setSelectedAssignmentId(assignment.id)}>
                          <Card mode="outlined" style={[styles.assignmentCard, { borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant }, selected && { backgroundColor: theme.colors.primaryContainer }]}>
                            <Card.Content style={styles.assignmentCardContent}>
                              <Icon source="file-document-outline" size={24} color={selected ? theme.colors.primary : theme.colors.onSurfaceVariant} />
                              <View style={styles.assignmentDetails}>
                                <Text variant="titleMedium">{assignment.title}</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                  {assignment.type.toUpperCase()} · Due {assignment.dueAt ? formatNamedDate(new Date(assignment.dueAt)) : "No due date"}
                                </Text>
                              </View>
                              <Icon source={selected ? "check-circle" : "chevron-right"} size={24} color={selected ? theme.colors.primary : theme.colors.onSurfaceVariant} />
                            </Card.Content>
                          </Card>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
                <Button mode="contained" icon="arrow-right" contentStyle={styles.actionContent} disabled={!selectedAssignmentId} onPress={() => {
                  if (selectedAssignmentId) { form.setFieldValue("reportAssignmentId", selectedAssignmentId); setStep(2); }
                }}>Continue to Upload</Button>
              </>
            ) : (
              <>
                {selectedAssignment && <Card mode="outlined" style={styles.selectedCard}>
                  <Card.Content style={styles.selectedCardContent}>
                    <View style={{ flex: 1 }}>
                      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>ASSIGNMENT</Text>
                      <Text variant="titleMedium">{selectedAssignment.title}</Text>
                    </View>
                    <Button compact onPress={() => setStep(1)}>Change</Button>
                  </Card.Content>
                </Card>}
                {selectedAssignment && templates[selectedAssignment.type] && <Button icon="download" mode="outlined" onPress={() => Linking.openURL(templates[selectedAssignment.type]!.url)}>
                  Download {selectedAssignment.type} report template
                </Button>}
                <ReportFields form={form} fields={["documents"]} />
                <form.ErrorMessage />
                <form.Submit submitLabel="Create" submittingLabel="Creating..." allowSubmitWithoutChanges />
              </>
            )}
          </form.AppForm>
        </AppView>
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  stepHeader: { gap: 4, marginBottom: 16 },
  assignmentList: { gap: 12, marginBottom: 20 },
  assignmentCard: { borderWidth: 1.5 },
  assignmentCardContent: { alignItems: "center", flexDirection: "row", gap: 12, paddingVertical: 16 },
  assignmentDetails: { flex: 1, gap: 4 },
  actionContent: { height: 48 },
  selectedCard: { marginBottom: 16 },
  selectedCardContent: { alignItems: "center", flexDirection: "row", paddingVertical: 8 },
});
