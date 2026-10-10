import { OJTSchema, OJTsResponseSchema } from "@/schemas/ojt.schema";
import { get, put } from "./request.api";

export const getOJT = async () => get("/ojt", OJTSchema);

export const getOJTs = async () => get("/ojt/all", OJTsResponseSchema);

export const getOJTById = async (id: number) => get(`/ojt/${id}`, OJTSchema);
export const updateReportDeadlines = async (id: number, data: { daily?: string; weekly?: string; monthly?: string }) =>
  put(`/ojt/${id}/report-deadlines`, data, undefined, OJTSchema);
