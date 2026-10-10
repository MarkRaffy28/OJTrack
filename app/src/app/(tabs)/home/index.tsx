import { useAuthUser } from "@/store/auth.store";
import { StudentDashboardScreen } from "./student-dashboard";
import { SupervisorDashboardScreen } from "./supervisor-dashboard";

export default function HomeScreen() {
  const user = useAuthUser();

  if (user?.role === "supervisor") {
    return <SupervisorDashboardScreen />;
  }

  return <StudentDashboardScreen />;
}