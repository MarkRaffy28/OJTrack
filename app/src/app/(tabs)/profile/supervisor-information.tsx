import { useState, useCallback } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { router } from "expo-router";
import { Appbar, Card, Text, ActivityIndicator } from "react-native-paper";

import { AppView } from "@/components/ui/AppView";
import { SupervisorFields } from "@/components/fields/SupervisorFields";
import { OfficeFields } from "@/components/fields/OfficeFields";
import { SafeView } from "@/components/ui/SafeView";
import { useAppForm } from "@/form/hook";
import { useAuthUser } from "@/store/auth.store";
import { useRefreshUser } from "@/hooks/useRefreshUser";
import { SupervisorUser } from "@/schemas/user.schema";

export default function SupervisorInformationScreen() {
  const user = useAuthUser() as SupervisorUser | null;
  const { refreshing, refreshUser } = useRefreshUser();

  const supervisorDetail = user?.supervisorDetail;
  const office = supervisorDetail?.office;

  const supervisorForm = useAppForm({
    defaultValues: {
      fullName: user?.fullName ?? "",
      position: supervisorDetail?.position ?? "",
      email: user?.email ?? "",
      contactNumber: user?.contactNumber ?? "",
    },
  });

  const officeForm = useAppForm({
    defaultValues: {
      name: office?.name ?? "",
      address: office?.address ?? "",
      contactEmail: office?.contactEmail ?? "",
      contactPhone: office?.contactPhone ?? "",
      morningIn: office?.morningIn ?? "",
      morningOut: office?.morningOut ?? "",
      afternoonIn: office?.afternoonIn ?? "",
      afternoonOut: office?.afternoonOut ?? "",
    },
  });

  return (
    <SafeView>
      <Appbar.Header elevated statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Supervisor Information" />
      </Appbar.Header>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshUser} />
        }
      >
        <AppView>
          {/* Supervisor Details Section */}
          <Card style={{ marginBottom: 16 }}>
            <Card.Title title="Supervisor Details" />
            <Card.Content>
              <supervisorForm.AppForm>
                <SupervisorFields form={supervisorForm} editable={false} />
              </supervisorForm.AppForm>
            </Card.Content>
          </Card>

          {/* Assigned Office Section */}
          <Card style={{ marginBottom: 16 }}>
            <Card.Title title="Assigned Office Details" />
            <Card.Content>
              {office ? (
                <officeForm.AppForm>
                  <OfficeFields form={officeForm} editable={false} />
                </officeForm.AppForm>
              ) : (
                <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
                  No office assigned yet
                </Text>
              )}
            </Card.Content>
          </Card>

          <Text style={{ textAlign: "center", marginVertical: 8, opacity: 0.7 }}>
            Supervisor & office details are managed by the institution
          </Text>
        </AppView>
      </ScrollView>
    </SafeView>
  );
}
