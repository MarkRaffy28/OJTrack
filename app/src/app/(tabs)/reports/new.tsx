import { api } from "@/api";
import { ReportFields } from "@/components/fields/ReportsFields";
import { AppView } from "@/components/ui/AppView";
import { SafeView } from "@/components/ui/SafeView";
import { useAppForm } from "@/form/hook";
import { CreateReportForm, CreateReportFormSchema } from "@/schemas/report.schema";
import { useShowSnackbar } from "@/store/snackbar.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { formatDateOnly } from "@/utils/date.util";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Platform, ScrollView } from "react-native";
import { Appbar } from "react-native-paper";

export default function NewReportScreen() {
  const showSnackbar = useShowSnackbar();

  const mutation = useMutation({
    mutationFn: api.createReport,
    onSuccess: () => {
      showSnackbar("Report created successfully");

      router.back();
    },
  });

  const form = useAppForm({
    defaultValues: {
      type: "daily",
      reportDate: formatDateOnly(new Date()),
      documents: [],
    } as CreateReportForm,
    validators: {
      onMount: CreateReportFormSchema,
      onChange: CreateReportFormSchema,
      onSubmit: CreateReportFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const formData = new FormData();

        formData.append("type", value.type);
        formData.append("reportDate", value.reportDate);

        for (const file of value.documents) {
          if (!file.uri) {
            throw new Error("Document file is required");
          }

          if (Platform.OS === "web") {
            const res = await fetch(file.uri);
            const blob = await res.blob();
            formData.append("documents[]", blob, file.name);
          } else {
            formData.append("documents[]", {
              uri: file.uri,
              name: file.name,
              type: file.type || "application/octet-stream",
            } as any);
          }
        }

        await mutation.mutateAsync(formData);
      } catch (error) {
        form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
      }
    },
  });

  return (
    <SafeView>
      <Appbar.Header elevated statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="New Report" />
      </Appbar.Header>

      <ScrollView>
        <AppView>
          <form.AppForm>
            <ReportFields form={form} fields={["type", "reportDate", "documents"]} />

            <form.ErrorMessage />

            <form.Submit
              submitLabel="Create"
              submittingLabel="Creating..."
              allowSubmitWithoutChanges
            />
          </form.AppForm>
        </AppView>
      </ScrollView>
    </SafeView>
  );
}
