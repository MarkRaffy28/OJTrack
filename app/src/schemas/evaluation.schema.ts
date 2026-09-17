import { z } from "zod";

export const EvaluationStatusSchema = z.enum(["draft", "submitted", "finalized"]);

export const EvaluationSchema = z.object({
  id: z.number(),
  studentOjtId: z.number(),
  quality: z.number(),
  productivity: z.number(),
  initiative: z.number(),
  timeManagementPunctuality: z.number(),
  properAttireGrooming: z.number(),
  remarks: z.string().nullable(),
  totalPoints: z.number(),
  status: EvaluationStatusSchema,
  submittedAt: z.string().nullable(),
});

export const EvaluationResponseSchema = z.object({
  evaluation: EvaluationSchema.nullable(),
  eligible: z.boolean(),
  canEdit: z.boolean(),
  triggerDays: z.number(),
  evaluationOpen: z.boolean(),
});

export type Evaluation = z.infer<typeof EvaluationSchema>;
export type EvaluationResponse = z.infer<typeof EvaluationResponseSchema>;

