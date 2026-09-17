import {
  AttendanceHistoryItemResponseSchema,
  AttendanceHistoryResponseSchema,
  AttendanceResponseSchema,
  ManualAttendanceRequest,
  ManualAttendanceRequestSchema,
  QRAttendanceRequest,
  QRAttendanceRequestSchema,
  QRCodeResponseSchema,
} from "@/schemas/attendance.schema";
import { get, post } from "./request.api";

export const getTodayAttendance = async () =>
  get("/attendance/today", AttendanceResponseSchema);

export const submitManualAttendance = async (data: ManualAttendanceRequest) =>
  post("/attendance/manual", data, ManualAttendanceRequestSchema);

export const submitQrAttendance = async (data: QRAttendanceRequest) =>
  post("/attendance/qr", data, QRAttendanceRequestSchema);

export const getAttendanceHistory = async () =>
  get("/attendance", AttendanceHistoryResponseSchema);

export const getTraineeAttendanceHistory = async (studentId?: number) =>
  get(studentId ? `/attendance?student_id=${studentId}` : "/attendance", AttendanceHistoryResponseSchema);

export const getAttendance = async (id: number) =>
  get(`/attendance/${id}`, AttendanceHistoryItemResponseSchema);

export const approveAttendance = async (id: number, slot?: string) =>
  post(`/attendance/${id}/approve`, slot ? { slot } : {}, undefined, AttendanceHistoryItemResponseSchema);

export const getQrCode = async () =>
  get("/attendance/supervisor/qr", QRCodeResponseSchema);
