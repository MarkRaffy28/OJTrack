import { RefreshControl, ScrollView } from "react-native";
import { router } from "expo-router";
import { Appbar, Text } from "react-native-paper";

import { AppView } from "@/components/ui/AppView";
import { IdentityFields } from "@/components/fields/IdentityFields";
import { SafeView } from "@/components/ui/SafeView";
import { StudentFields } from "@/components/fields/StudentFields";
import { useAppForm } from "@/form/hook";
import { useRefreshUser } from "@/hooks/useRefreshUser";
import { useAuthUser } from "@/store/auth.store";

export default function AcademicInformationScreen() {
  const user = useAuthUser();

  const { refreshing, refreshUser } = useRefreshUser();

  const isStudent = user?.role === "student";

  const form = useAppForm({
    defaultValues: {
      userId: user?.userId ?? "",
      year: isStudent ? user?.studentDetail.year : "",
      program: isStudent ? user?.studentDetail.program : "",
      major: isStudent ? user?.studentDetail.major : "",
      section: isStudent ? user?.studentDetail.section : "",
    },
  });

  return (
    <SafeView>
      <Appbar.Header elevated statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Academic Information" />
      </Appbar.Header>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshUser} />
        }
      >
        <AppView>
          <form.AppForm>
            <IdentityFields
              form={form}
              fields={["userId"]}
              editable={false}
            />

            <StudentFields form={form} editable={false} />

            <Text>Academic information are managed by the institution</Text>
          </form.AppForm>
        </AppView>
      </ScrollView>
    </SafeView>
  );
}