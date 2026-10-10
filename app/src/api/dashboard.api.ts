import {
  StudentDashboardResponseSchema,
  SupervisorDashboardResponseSchema,
} from "@/schemas/dashboard.schema";
import { get } from "./request.api";

export const getStudentDashboardMetrics = () =>
  get("/dashboard/student", StudentDashboardResponseSchema);

export const getSupervisorDashboardMetrics = () =>
  get("/dashboard/supervisor", SupervisorDashboardResponseSchema);