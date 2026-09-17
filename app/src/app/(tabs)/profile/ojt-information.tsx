import { useState, useCallback, useEffect } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { router } from "expo-router";
import { Appbar, Text, Card, ActivityIndicator } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";
import { AppView } from "@/components/ui/AppView";
import { Dialog } from "@/components/ui/Dialog";
import { OJTDetailFields } from "@/components/fields/OJTDetailFields";
import { SupervisorFields } from "@/components/fields/SupervisorFields";
import { OfficeFields } from "@/components/fields/OfficeFields";
import { SafeView } from "@/components/ui/SafeView";
import { useAppForm } from "@/form/hook";
import { OJT } from "@/schemas/ojt.schema";
import { getApiErrorMessage } from "@/utils/api.util";
import { EmptyPlaceholder } from "@/components/ui/EmptyPlaceholder";

export default function OJTInformationScreen() {
  const {
    data: ojt,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<OJT>({
    queryKey: ["ojt"],
    queryFn: api.getOJT,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const ojtForm = useAppForm({
    defaultValues: {
      academicYear: ojt?.academicYear ?? "",
      term: ojt?.term ?? "1st",
      requiredHours: ojt?.requiredHours ?? 0,
      renderedHours: ojt?.renderedHours ?? 0,
      status: ojt?.status ?? "pending",
      startDate: ojt?.startDate ?? "",
      endDate: ojt?.endDate ?? "",
    },
  });

  const officeForm = useAppForm({
    defaultValues: {
      name: ojt?.office?.name ?? "",
      address: ojt?.office?.address ?? "",
      contactEmail: ojt?.office?.contactEmail ?? "",
      contactPhone: ojt?.office?.contactPhone ?? "",
      morningIn: ojt?.office?.morningIn ?? "",
      morningOut: ojt?.office?.morningOut ?? "",
      afternoonIn: ojt?.office?.afternoonIn ?? "",
      afternoonOut: ojt?.office?.afternoonOut ?? "",
    },
  });

  const supervisorForm = useAppForm({
    defaultValues: {
      fullName: ojt?.supervisor?.fullName ?? "",
      position: ojt?.supervisor?.supervisorDetail?.position ?? "",
      email: ojt?.supervisor?.email ?? "",
      contactNumber: ojt?.supervisor?.contactNumber ?? "",
    },
  });

  if (isError) {
    return (
      <SafeView>
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="OJT Information" />
        </Appbar.Header>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isRefetching}
              onRefresh={onRefresh}
            />
          }
        >
          <AppView>
            <EmptyPlaceholder
              title="Failed to fetch OJT information"
              description={getApiErrorMessage(error)}
            />
          </AppView>
        </ScrollView>
      </SafeView>
    );
  }

  return (
    <SafeView>
      <Appbar.Header elevated statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="OJT Information" />
      </Appbar.Header>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing || isRefetching} onRefresh={onRefresh} />
        }
      >
        <AppView>
          {isLoading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} />
          ) : (
            <>
              {/* OJT Details Section */}
              <Card style={{ marginBottom: 16 }}>
                <Card.Title title="OJT Details" />
                <Card.Content>
                  <ojtForm.AppForm>
                    <OJTDetailFields form={ojtForm} editable={false} />
                  </ojtForm.AppForm>
                </Card.Content>
              </Card>

              {/* Office Details Section */}
              <Card style={{ marginBottom: 16 }}>
                <Card.Title title="Office Details" />
                <Card.Content>
                  {ojt?.office ? (
                    <officeForm.AppForm>
                      <OfficeFields form={officeForm} editable={false} />
                    </officeForm.AppForm>
                  ) : (
                    <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
                      Not assigned yet
                    </Text>
                  )}
                </Card.Content>
              </Card>

              {/* Supervisor Details Section */}
              <Card style={{ marginBottom: 16 }}>
                <Card.Title title="Supervisor Details" />
                <Card.Content>
                  {ojt?.supervisor ? (
                    <supervisorForm.AppForm>
                      <SupervisorFields form={supervisorForm} editable={false} />
                    </supervisorForm.AppForm>
                  ) : (
                    <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
                      Not assigned yet
                    </Text>
                  )}
                </Card.Content>
              </Card>

              <Text style={{ textAlign: "center", marginVertical: 8, opacity: 0.7 }}>
                Academic & OJT information are managed by the institution
              </Text>
            </>
          )}
        </AppView>
      </ScrollView>
    </SafeView>
  );
}
