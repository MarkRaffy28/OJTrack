import { ScrollView } from "react-native";

import { CommonRegistration } from "@/components/registration/CommonRegistration";
import { SafeView } from "@/components/ui/SafeView";
import { StudentRegistration } from "@/components/registration/StudentRegistration";
import { useAuthUser } from "@/store/auth.store";

export default function CompleteRegistrationScreen() {
  const user = useAuthUser();

  return (
    <SafeView>
      <ScrollView>
        {user?.role === "student" ? <StudentRegistration /> : <CommonRegistration />}
      </ScrollView>
    </SafeView>
  );
}
