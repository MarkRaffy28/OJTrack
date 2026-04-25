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
  "UPDATE_SUPERVISOR_NOTES",
  "CREATE_OFFICE",
  "UPDATE_OFFICE",
  "DELETE_OFFICE",
  "UPDATE_SETTINGS",
  "DELETE_TRAINEE",
  "ASSIGN_SUPERVISOR",
  "EDIT_USER",
  "EVALUATE_REPORT"
];

export const ActivityTargetTypes = ["REPORT", "PROFILE", "DTR", "USER", "OJT", "OFFICE", "SYSTEM"];

export const logActivitySchema = z.object({
  databaseId: z.coerce.number().int().positive(),
  ojtId: z.coerce.number().int().positive().optional(),
  action: z.enum(ActivityActions),
  targetType: z.enum(ActivityTargetTypes).optional(),
  targetId: z.coerce.number().int().positive().optional(),
  description: z.string().max(500).optional(),
});

export const getActivitiesSchema = z.object({
  databaseId: z.coerce.number().int().positive(),
  ojtId: z.coerce.number().int().positive().optional(),
});