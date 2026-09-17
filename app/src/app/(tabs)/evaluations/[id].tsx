import { api } from "@/api";
import { EmptyPlaceholder } from "@/components/ui/EmptyPlaceholder";
import { SafeView } from "@/components/ui/SafeView";
import { CONTENT_MAX_WIDTH } from "@/constants/responsive.constant";
import { EvaluationInput } from "@/api/evaluation.api";
import { getApiErrorMessage } from "@/utils/api.util";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Card, Divider, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { useShowSnackbar } from "@/store/snackbar.store";

const criteria = [
  { key: "quality", label: "Quality", points: 40, description: "Overall performance on the trainee, his/her output in every task assigned to him/her. This involves his/her knowledge on the application he/she used in the processing of an inputs as well as its neatness and orderliness." },
  { key: "productivity", label: "Productivity", points: 20, description: "The amount of work produced during training. How the task is done in a productive manner, the approaches and methods use towards greater produce at lower cost." },
  { key: "initiative", label: "Initiative", points: 20, description: "The trainee's ability to perform work/task without being told, and the quality of task executed by the trainee that is beyond what is expected." },
  { key: "timeManagementPunctuality", label: "Time Management / Punctuality", points: 10, description: "The trainee's punctuality in submission of his/her work and use of time efficiently." },
  { key: "properAttireGrooming", label: "Proper Attire and Good Grooming", points: 10, description: "The trainee must wear the prescribed OJT Uniform at all times during Practicum and maintain neatness and proper grooming." },
] as const;

export default function EvaluationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ojtId = Number(id);
  const theme = useTheme();
  const snackbar = useShowSnackbar();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["evaluation", ojtId],
    queryFn: () => api.getEvaluation(ojtId),
    enabled: Number.isInteger(ojtId) && ojtId > 0,
  });
  const [values, setValues] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (data?.evaluation) {
      setValues(Object.fromEntries(criteria.map(({ key }) => [key, String(data.evaluation?.[key] ?? "0")] )));
      setRemarks(data.evaluation.remarks ?? "");
    }
  }, [data]);

  const input = useMemo<EvaluationInput>(() => ({
    quality: Number(values.quality || 0),
    productivity: Number(values.productivity || 0),
    initiative: Number(values.initiative || 0),
    timeManagementPunctuality: Number(values.timeManagementPunctuality || 0),
    properAttireGrooming: Number(values.properAttireGrooming || 0),
    remarks,
  }), [values, remarks]);
  const total = Object.values(input).filter((v): v is number => typeof v === "number").reduce((sum, value) => sum + value, 0);

  const mutation = useMutation({
    mutationFn: (submit: boolean) => submit ? api.submitEvaluation(ojtId, input) : api.saveEvaluation(ojtId, input),
    onSuccess: (_, submit) => {
      queryClient.invalidateQueries({ queryKey: ["evaluation", ojtId] });
      snackbar(submit ? "Evaluation submitted successfully" : "Evaluation saved as draft");
      if (submit) router.back();
    },
    onError: (error) => snackbar(getApiErrorMessage(error), "error"),
  });
  const finalizeMutation = useMutation({
    mutationFn: () => api.finalizeEvaluation(ojtId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation", ojtId] });
      snackbar("Evaluation finalized successfully");
    },
    onError: (error) => snackbar(getApiErrorMessage(error), "error"),
  });

  if (isLoading) return <SafeView style={{ backgroundColor: theme.colors.background }}><View style={styles.center}><ActivityIndicator size="large" /></View></SafeView>;
  if (isError || !data) return <SafeView style={{ backgroundColor: theme.colors.background }}><Appbar.Header statusBarHeight={0}><Appbar.BackAction onPress={() => router.back()} /><Appbar.Content title="Evaluation" /></Appbar.Header><EmptyPlaceholder title="Evaluation unavailable" description="The evaluation record could not be loaded." /></SafeView>;
  if (!data.eligible && !data.evaluation) return <SafeView style={{ backgroundColor: theme.colors.background }}><Appbar.Header statusBarHeight={0}><Appbar.BackAction onPress={() => router.back()} /><Appbar.Content title="Evaluation" /></Appbar.Header><EmptyPlaceholder title="Evaluation not open" description={`Evaluation opens ${data.triggerDays} day(s) before the OJT end date. An administrator may also open it manually.`} /></SafeView>;

  const disabled = !data.canEdit || mutation.isPending;
  return <SafeView style={{ backgroundColor: theme.colors.background }}><View style={styles.wrapper}>
    <Appbar.Header elevated statusBarHeight={0}><Appbar.BackAction onPress={() => router.back()} /><Appbar.Content title="Evaluate Trainee" /></Appbar.Header>
    <ScrollView contentContainerStyle={styles.content}>
      <Surface style={[styles.intro, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
        <Text variant="titleLarge" style={styles.bold}>Supervisor Evaluation</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 6 }}>Rate the trainee against each criterion. Scores must stay within the maximum points shown. Total possible score: 100 points.</Text>
        {data.evaluation && <Text variant="labelLarge" style={{ color: theme.colors.primary, marginTop: 10 }}>Status: {data.evaluation.status.toUpperCase()}</Text>}
      </Surface>
      {criteria.map(({ key, label, points, description }) => <Card key={key} style={styles.card}><Card.Content>
        <View style={styles.row}><Text variant="titleMedium" style={styles.bold}>{label}</Text><Text variant="labelLarge">/{points} pts</Text></View>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>{description}</Text>
        <TextInput mode="outlined" label={`Score (0-${points})`} keyboardType="numeric" value={values[key] ?? ""} disabled={disabled} onChangeText={(value) => setValues((current) => ({ ...current, [key]: value.replace(/\D/g, "") }))} />
      </Card.Content></Card>)}
      <TextInput mode="outlined" label="Remarks (optional)" multiline numberOfLines={4} value={remarks} disabled={disabled} onChangeText={setRemarks} />
      <Divider />
      <Text variant="headlineSmall" style={[styles.bold, { textAlign: "right" }]}>Total: {total} / 100</Text>
      {data.canEdit && <View style={styles.actions}><Button mode="outlined" disabled={mutation.isPending} onPress={() => mutation.mutate(false)}>Save Draft</Button><Button mode="contained" loading={mutation.isPending} onPress={() => mutation.mutate(true)}>Submit Evaluation</Button></View>}
      {data.evaluation?.status === "submitted" && <View style={styles.actions}><Button mode="contained" loading={finalizeMutation.isPending} onPress={() => finalizeMutation.mutate()}>Finalize Evaluation</Button></View>}
    </ScrollView>
  </View></SafeView>;
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center" },
  content: { padding: 16, gap: 14 },
  intro: { borderRadius: 18, padding: 16 },
  card: { borderRadius: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bold: { fontWeight: "700" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, paddingBottom: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
