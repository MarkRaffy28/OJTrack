import { z } from "zod";
import { OfficeSchema } from "./office.schema";
import { StudentSummarySchema, SupervisorSummarySchema } from "./user.schema";

export const OJTStatusSchema = z.enum(["pending", "ongoing", "completed", "dropped"]);

export const OJTTermSchema = z.enum(["1st", "2nd", "Summer"]);

export const OJTSchema = z.object({
  id: z.number(),

  student: StudentSummarySchema.nullable(),
  supervisor: SupervisorSummarySchema.nullable(),
  office: OfficeSchema.nullable(),

  academicYear: z.string().max(20),
  term: OJTTermSchema,

  requiredHours: z.coerce.number(),
  renderedHours: z.coerce.number(),

  status: OJTStatusSchema,
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const OJTSummarySchema = OJTSchema.omit({
  student: true,
  supervisor: true,
});

export const OJTsResponseSchema = z.array(OJTSchema);

export type OJTStatus = z.infer<typeof OJTStatusSchema>;
export type OJTTerm = z.infer<typeof OJTTermSchema>;

export type OJT = z.infer<typeof OJTSchema>;

export type OJTSummary = z.infer<typeof OJTSummarySchema>;