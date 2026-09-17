import { z } from "zod";
import { OJTSummarySchema } from "./ojt.schema";

const AttendanceTimesSchema = z.object({
  morningIn: z.string().nullable(),
  morningInVerified: z.boolean(),

  morningOut: z.string().nullable(),
  morningOutVerified: z.boolean(),

  afternoonIn: z.string().nullable(),
  afternoonInVerified: z.boolean(),

  afternoonOut: z.string().nullable(),
  afternoonOutVerified: z.boolean(),
});

export const AttendanceSchema = z
  .object({
    id: z.number(),
    ojt: OJTSummarySchema,
    date: z.iso.date(),
  })
  .extend(AttendanceTimesSchema.shape);

export const AttendanceHistoryItemSchema = AttendanceSchema.omit({
  ojt: true,
}).extend({
  totalHours: z.number().default(0)
});

export const AttendanceHistorySchema = z.array(AttendanceHistoryItemSchema);

export const AttendanceHistoryResponseSchema = AttendanceHistorySchema;
export const AttendanceHistoryItemResponseSchema = AttendanceHistoryItemSchema;

export const ManualAttendanceRequestSchema = AttendanceSchema.omit({
  ojt: true,
  date: true,
})
  .partial({
    morningIn: true,
    morningInVerified: true,
    morningOut: true,
    morningOutVerified: true,
    afternoonIn: true,
    afternoonInVerified: true,
    afternoonOut: true,
    afternoonOutVerified: true,
  });

export const QRAttendanceRequestSchema = z.object({
  qrPayload: z.string(),
});

export const QRCodeResponseSchema = z.object({
  token: z.string(),
  officeName: z.string(),
});

export const AttendanceResponseSchema = AttendanceSchema;

export type Attendance = z.infer<typeof AttendanceSchema>;

export type AttendanceHistoryItem = z.infer<typeof AttendanceHistoryItemSchema>;
export type AttendanceHistory = z.infer<typeof AttendanceHistorySchema>;

export type ManualAttendanceRequest = z.infer<typeof ManualAttendanceRequestSchema>;
export type QRAttendanceRequest = z.infer<typeof QRAttendanceRequestSchema>;