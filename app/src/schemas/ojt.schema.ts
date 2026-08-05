import { z } from "zod";
import { OfficeSchema } from "./office.schema";
import { StudentUserSchema, SupervisorUserSchema } from "./user.schema";

export const OjtStatusSchema = z.enum(["pending", "ongoing", "completed", "dropped"]);

export const OjtTermSchema = z.enum(["1st", "2nd", "Summer"]);

export const OjtSchema = z.object({
  id: z.number().int().positive(),

  student: StudentUserSchema,
  supervisor: SupervisorUserSchema.nullable(),
  office: OfficeSchema,

  academic_year: z.string().max(20),
  term: OjtTermSchema,

  required_hours: z.number(),
  rendered_hours: z.number(),

  status: OjtStatusSchema,
  start_date: z.iso.date(),
  end_date: z.iso.date(),

  created_at: z.iso.datetime(),

  updated_at: z.iso.datetime(),
});

export const CreateOjtSchema = z.object({
  student_id: z.number().int().positive(),
  supervisor_id: z.number().int().positive().nullable().optional(),
  office_id: z.number().int().positive(),

  academic_year: z.string().max(20),
  term: OjtTermSchema,
  required_hours: z.number().positive(),

  start_date: z.iso.date(),
  end_date: z.iso.date(),
});

export const UpdateOjtSchema = CreateOjtSchema.extend({
  status: OjtStatusSchema.optional(),
  rendered_hours: z.number().min(0).optional(),
}).partial();

export type OjtStatus = z.infer<typeof OjtStatusSchema>;
export type OjtTerm = z.infer<typeof OjtTermSchema>;

export type Ojt = z.infer<typeof OjtSchema>;

export type CreateOjtInput = z.infer<typeof CreateOjtSchema>;
export type UpdateOjtInput = z.infer<typeof UpdateOjtSchema>;
