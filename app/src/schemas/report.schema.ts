import { z } from "zod";
import { OjtSchema } from "./ojt.schema";
import { InstructorUserSchema } from "./user.schema";

export const ReportTypeSchema = z.enum([
  "daily",
  "weekly",
  "monthly",
  "midterm",
  "final",
  "incident",
]);

export const ReportStatusSchema = z.enum(["pending", "approved", "rejected"]);

const ReportDocumentSchema = z.object({
  name: z.string(),
  path: z.string(),
  url: z.string(),
});

export const ReportSchema = z.object({
  id: z.number().int().positive(),

  ojt: OjtSchema,

  type: ReportTypeSchema,
  report_date: z.iso.date(),
  documents: z.array(ReportDocumentSchema).nullable(),

  status: ReportStatusSchema,

  reviewed_by: InstructorUserSchema.nullable(),
  reviewed_at: z.iso.datetime().nullable(),
  feedback: z.string().nullable(),

  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const CreateReportSchema = z.object({
  ojt_id: z.number().int().positive(),
  type: ReportTypeSchema,
  report_date: z.iso.date(),
  documents: z.array(z.string()).optional(),
});

export const UpdateReportSchema = CreateReportSchema.partial().extend({
  status: ReportStatusSchema.optional(),
  reviewed_by_id: z.number().int().positive().nullable().optional(),
  feedback: z.string().nullable().optional(),
});

export type ReportType = z.infer<typeof ReportTypeSchema>;
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export type Report = z.infer<typeof ReportSchema>;

export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type UpdateReportInput = z.infer<typeof UpdateReportSchema>;
