import { z } from "zod";

export const getOjtsSchema = z.object({
  role: z.enum(["student", "supervisor"]),
  databaseId: z.coerce.number().int().positive(),
});

export const updateSupervisorNotesSchema = z.object({
  ojtId: z.coerce.number().int().positive(),
  supervisorId: z.coerce.number().int().positive(),
  notes: z.string().max(5000).nullable().optional(),
});