import { useAuthUser } from "@/store/auth.store";
import StudentManualAttendanceScreen from "./student-manual-attedance";
import SupervisorQRScreen from "./supervisor-qr";

export default function QRScreen() {
  const user = useAuthUser();

  if (user?.role === "student") {
    return <StudentManualAttendanceScreen />;
  } else {
    return <SupervisorQRScreen />;
  }
}