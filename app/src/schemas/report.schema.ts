import { z } from "zod";
import { InstructorUserSchema } from "./user.schema";

export const FileDataSchema = z.object({
  uri: z.string().optional(),
  url: z.string().optional(),
  path: z.string().optional(),
  name: z.string(),
  size: z.number().optional(),
  type: z.string().optional(),
  mimeType: z.string().optional(),
});

export const ReportTypeSchema = z.enum([
  "daily",
  "weekly",
  "monthly",
  "terminal",
]);

export const ReportTemplatesSchema = z.object({
  daily: z.object({ path: z.string(), url: z.string() }).nullable(),
  weekly: z.object({ path: z.string(), url: z.string() }).nullable(),
  monthly: z.object({ path: z.string(), url: z.string() }).nullable(),
  terminal: z.object({ path: z.string(), url: z.string() }).nullable(),
});

export const ReportStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const ReportAssignmentSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: ReportTypeSchema,
  dueAt: z.string().nullable(),
  allowLateSubmission: z.boolean(),
  submitted: z.boolean(),
  report: z.any().nullable().optional(),
});

export const ReportSchema = z.object({
  id: z.number(),
  studentId: z.number(),
  ojtId: z.number(),

  reportAssignmentId: z.coerce.number().positive(),
  type: ReportTypeSchema,
  assignment: z.object({
    id: z.number(),
    title: z.string(),
    type: ReportTypeSchema,
    dueAt: z.string().nullable(),
    allowLateSubmission: z.boolean(),
  }).nullable().optional(),
  reportDate: z.string(),
  deadline: z.string().nullable(),
  isLate: z.boolean(),
  documents: z
    .array(FileDataSchema)
    .min(1, "Upload at least 1 document.")
    .max(3, "Upload at most 3 documents."),

  status: ReportStatusSchema,

  student: z
    .object({
      id: z.number(),
      fullName: z.string(),
      email: z.string(),
      user_id: z.string().optional(),
      profilePicture: z.string().nullable(),
    })
    .nullable()
    .optional(),

  reviewedBy: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
});

export const CreateReportFormSchema = z.object({
  reportAssignmentId: z.coerce.number().positive(),
  reportDate: z.string().optional(),
  documents: ReportSchema.shape.documents,
});

export const UpdateReportFormSchema = ReportSchema.omit({
  studentId: true,
  ojtId: true,
});

export const ReviewReportRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]).optional(),
  feedback: z.string().optional(),
});

export const CreateReportRequestSchema = z.instanceof(FormData);
export const UpdateReportRequestSchema = z.instanceof(FormData);

export const DeleteReportRequestSchema = ReportSchema.pick({ id: true });

export const ReportsResponseSchema = z.array(ReportSchema);
export const ReportResponseSchema = ReportSchema;
export const ReportAssignmentsResponseSchema = z.array(ReportAssignmentSchema);

export type ReportType = z.infer<typeof ReportTypeSchema>;
export type ReportTemplates = z.infer<typeof ReportTemplatesSchema>;
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export type Report = z.infer<typeof ReportSchema>;
export type ReportAssignment = z.infer<typeof ReportAssignmentSchema>;

export type CreateReportRequest = z.infer<typeof CreateReportRequestSchema>;
export type UpdateReportRequest = z.infer<typeof UpdateReportRequestSchema>;
export type ReviewReportRequest = z.infer<typeof ReviewReportRequestSchema>;
export type DeleteReportRequest = z.infer<typeof DeleteReportRequestSchema>;

export type CreateReportForm = z.input<typeof CreateReportFormSchema>;
export type UpdateReportForm = z.input<typeof UpdateReportFormSchema>;
export type FileData = z.input<typeof FileDataSchema>;
