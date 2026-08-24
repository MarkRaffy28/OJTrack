import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

export default function Index() {
  const { session } = useAuthStore();

  if (!session) {
    return <Redirect href="(auth)/login" />;
  }

  if (session.user?.status === "pre_activated") {
    return <Redirect href="complete-registration" />;
  }

  return <Redirect href="(tabs)/home" />;
}
