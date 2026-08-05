import { z } from "zod";
import { OjtSchema } from "./ojt.schema";

export const AttendanceSchema = z.object({
  id: z.number().int().positive(),

  ojt: OjtSchema,

  date: z.iso.date(),

  morning_in: z.iso.time().nullable(),
  morning_in_verified: z.boolean(),

  morning_out: z.iso.time().nullable(),
  morning_out_verified: z.boolean(),

  afternoon_in: z.iso.time().nullable(),
  afternoon_in_verified: z.boolean(),

  afternoon_out: z.iso.time().nullable(),
  afternoon_out_verified: z.boolean(),

  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const CreateAttendanceSchema = z.object({
  ojt_id: z.number().int().positive(),

  date: z.iso.date(),

  morning_in: z.iso.time().nullable().optional(),
  morning_out: z.iso.time().nullable().optional(),
  afternoon_in: z.iso.time().nullable().optional(),
  afternoon_out: z.iso.time().nullable().optional(),
});

export const UpdateAttendanceSchema = CreateAttendanceSchema.partial().extend({
  morning_in_verified: z.boolean().optional(),
  morning_out_verified: z.boolean().optional(),
  afternoon_in_verified: z.boolean().optional(),
  afternoon_out_verified: z.boolean().optional(),
});

export type Attendance = z.infer<typeof AttendanceSchema>;
export type CreateAttendanceInput = z.infer<typeof CreateAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof UpdateAttendanceSchema>;
