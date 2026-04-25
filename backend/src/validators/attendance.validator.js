import { z } from "zod";

export const attendanceQuerySchema = z.object({
  studentId: z.coerce.number().int().positive(),
  ojtId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format').optional(),
});

export const getAttendanceByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const scanAttendanceSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  ojtId: z.coerce.number().int().positive(),
  qrPayLoad: z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }, z.object({
    o: z.coerce.number().int().positive(),
    t: z.coerce.number().int().positive(),
    s: z.string().min(1),
  })),
});

export const supervisorAttendanceSchema = z.object({
  supervisorId: z.coerce.number().int().positive(),
});

export const adminAttendanceQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});