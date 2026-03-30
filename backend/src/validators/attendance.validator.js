import { z } from "zod";

export const attendanceQuerySchema = z.object({
  studentId: z.string().regex(/^\d+$/, 'studentId must be a number'),
  ojtId: z.string().regex(/^\d+$/, 'ojtId must be a number'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
});