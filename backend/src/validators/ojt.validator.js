import { z } from "zod";

export const createOjtSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  academicYear: z.string().min(1),
  term: z.string().min(1),
  requiredHours: z.coerce.number().int().nonnegative(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  officeId: z.preprocess((val) => (val && !isNaN(Number(val)) ? Number(val) : null), z.number().int().positive().nullable().optional()),
  supervisorId: z.preprocess((val) => (val && !isNaN(Number(val)) ? Number(val) : null), z.number().int().positive().nullable().optional()),
  status: z.enum(["pending", "ongoing", "completed", "dropped"]).optional(),
});

export const getOjtsSchema = z.object({
  role: z.enum(["student", "supervisor", "admin"]),
  databaseId: z.coerce.number().int().positive(),
});

export const ojtIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateOjtSchema = z.object({
  ojtId: z.coerce.number().int().positive(),
  officeId: z.preprocess((val) => (val && !isNaN(Number(val)) ? Number(val) : null), z.number().int().positive().nullable()),
  supervisorId: z.preprocess((val) => (val && !isNaN(Number(val)) ? Number(val) : null), z.number().int().positive().nullable()),
  requiredHours: z.coerce.number().int().nonnegative(),
  renderedHours: z.coerce.number().int().nonnegative(),
  status: z.enum(["pending", "ongoing", "completed", "dropped"]),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  academicYear: z.string().nullable().optional(),
  term: z.string().nullable().optional(),
});

export const updateOjtSupervisorSchema = z.object({
  ojtId: z.coerce.number().int().positive(),
  supervisorId: z.preprocess((val) => (val && !isNaN(Number(val)) ? Number(val) : null), z.number().int().positive().nullable()),
});

export const updateSupervisorNotesSchema = z.object({
  ojtId: z.coerce.number().int().positive(),
  supervisorId: z.coerce.number().int().positive(),
  notes: z.string().max(5000).nullable().optional(),
});