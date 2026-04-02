import { z } from "zod";

export const attendanceQuerySchema = z.object({
  studentId: z.coerce.number().int().positive(),
  ojtId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
});

export const scanAttendanceSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  ojtId: z.coerce.number().int().positive(),
  qrPayLoad: z.object({
    o: z.coerce.number().int().positive(),
    t: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
    s: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  }),
});