import {
  CreateReportRequest,
  CreateReportRequestSchema,
  ReportResponseSchema,
  ReportsResponseSchema,
  ReviewReportRequest,
  ReviewReportRequestSchema,
  UpdateReportRequest,
  UpdateReportRequestSchema,
} from "@/schemas/report.schema";
import { post, get, patch, del } from "./request.api";

export const getReports = async () =>
  get("/reports", ReportsResponseSchema);

export const getReport = async (id: number) =>
  get(`/reports/${id}`, ReportResponseSchema);

export const createReport = async (data: CreateReportRequest) =>
  post("/reports", data, CreateReportRequestSchema, ReportResponseSchema);

export const updateReport = async (reportId: number, data: UpdateReportRequest) =>
  patch(`/reports/${reportId}`, data, UpdateReportRequestSchema, ReportResponseSchema);

export const reviewReport = async (reportId: number, data: ReviewReportRequest) =>
  post(`/reports/${reportId}/review`, data, ReviewReportRequestSchema, ReportResponseSchema);

export const deleteReport = async (reportId: number) =>
  del(`/reports/${reportId}`);