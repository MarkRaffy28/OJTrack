import { z } from "zod";
import { OJTStatusSchema } from "./ojt.schema";
import { AttendanceHistoryItemSchema, AttendanceSchema } from "./attendance.schema";

export const StudentDashboardSchema = z.object({
  student: z.object({
    name: z.string(),
    profilePicture: z.string().nullable(),
  }),

  ojt: z.object({
    status: OJTStatusSchema,
    officeName: z.string(),
    requiredHours: z.coerce.number(),
    completedHours: z.coerce.number(),
    remainingHours: z.coerce.number(),
    progress: z.coerce.number(),
  }).nullable(),

  attendance: AttendanceHistoryItemSchema.pick({
    morningIn: true,
    morningOut: true,
    afternoonIn: true,
    afternoonOut: true,
    totalHours: true,
  }),

  reports: z.object({
    pending: z.number(),
    submitted: z.number(),
    approved: z.number(),
    rejected: z.number(),
  }),
});

export const StudentDashboardResponseSchema = StudentDashboardSchema;

export const SupervisorDashboardSchema = z.object({
  supervisor: z.object({
    name: z.string(),
    position: z.string(),
    officeName: z.string(),
    profilePicture: z.string().nullable(),
  }),
  stats: z.object({
    totalTrainees: z.number(),
    activeTrainees: z.number(),
    presentToday: z.number(),
    pendingReports: z.number(),
    totalRenderedHours: z.number(),
  }),
});

export const SupervisorDashboardResponseSchema = SupervisorDashboardSchema;

export type StudentDashboard = z.infer<typeof StudentDashboardSchema>;
export type SupervisorDashboard = z.infer<typeof SupervisorDashboardSchema>;
