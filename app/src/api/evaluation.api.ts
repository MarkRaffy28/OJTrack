import { EvaluationResponseSchema } from "@/schemas/evaluation.schema";
import { get, post, put } from "./request.api";

export type EvaluationInput = {
  quality: number;
  productivity: number;
  initiative: number;
  timeManagementPunctuality: number;
  properAttireGrooming: number;
  remarks?: string;
};

export const getEvaluation = async (ojtId: number) =>
  get(`/evaluations/${ojtId}`, EvaluationResponseSchema);

export const saveEvaluation = async (ojtId: number, data: EvaluationInput) =>
  put(`/evaluations/${ojtId}`, data);

export const submitEvaluation = async (ojtId: number, data: EvaluationInput) =>
  post(`/evaluations/${ojtId}/submit`, data);

export const finalizeEvaluation = async (ojtId: number) =>
  post(`/evaluations/${ojtId}/finalize`);
