import { z } from "zod";

export const ActivityActions = [
  "LOGIN",
  "LOGOUT",
  "REGISTER",
  "UPDATE_PASSWORD",
  "UPDATE_PROFILE",
  "CREATE_REPORT",
  "UPDATE_REPORT",
  "DELETE_REPORT",
  "SUBMIT_REPORT",
  "TIME_IN",
  "TIME_OUT",
];

export const ActivityTargetTypes = ["REPORT", "PROFILE", "DTR", "USER"];

export const logActivitySchema = z.object({
  databaseId: z.coerce.number().int().positive(),
  ojtId: z.coerce.number().int().positive().optional(),
  action: z.enum(ActivityActions),
  targetType: z.enum(ActivityTargetTypes).optional(),
  targetId: z.coerce.number().int().positive().optional(),
  description: z.string().max(500).optional(),
});

export const fetchStudentActivitiesSchema = z.object({
  databaseId: z.coerce.number().int().positive(),
  ojtId: z.coerce.number().int().positive(),
});