import { fetchOrFail } from "../helpers/resource.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { logActivityController } from "./activity.controller.js";
import { getTodayAttendance, insertAttendance, isStudentInOffice, getSupervisorAttendanceRows } from "../models/attendance.model.js";
import { determineSession, verifyQr } from "../utils/attendance.util.js";
import { attendanceQuerySchema, scanAttendanceSchema, supervisorAttendanceSchema } from "../validators/attendance.validator.js";


export const getTodayAttendanceController = async (req, res) => {
  const data = validate(res, attendanceQuerySchema, req.query);
  if (!data) return;

  const { studentId, ojtId, date } = data;

  const dbRecord = await fetchOrFail(res, getTodayAttendance, [studentId, ojtId, date], "No attendance record found");
  if (!dbRecord) return;

  const record = {
    morningTimeIn: dbRecord?.morning_in ?? '',
    morningTimeOut: dbRecord?.morning_out ?? '',
    afternoonTimeIn: dbRecord?.afternoon_in ?? '',
    afternoonTimeOut: dbRecord?.afternoon_out ?? '',
  };

  return res.status(200).json(record);
};

export const scanAttendanceController = async (req, res) => {
  const data = validate(res, scanAttendanceSchema, req.body);
  if (!data) return;

  const { studentId, ojtId, qrPayLoad } = data;

  try {
    verifyQr(qrPayLoad.o, qrPayLoad.t, qrPayLoad.s);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  };

  if (!await fetchOrFail(res, isStudentInOffice, [studentId, qrPayLoad.o], "Student not assigned to this office")) return;

  let column;
  try {
    column = determineSession();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  };

  const now = new Date();
  const date = now.toISOString().slice(0, 10);

  const record = await getTodayAttendance(studentId, ojtId, date);

  if ((column === "morning_out" && (!record || !record["morning_in"])) ||
      (column === "afternoon_out" && (!record || !record["afternoon_in"]))) {
    const session = column.includes("morning") ? "Morning" : "Afternoon";
    return res.status(400).json({
      message: `Cannot log ${session} Time Out without logging ${session} Time In`
    });
  }

  if (record && record[column]) {
    return res.status(400).json({ message: "Session already recorded" });
  };

  await insertAttendance(studentId, ojtId, date, column);

  const action = column.endsWith("_in") ? "TIME_IN" : "TIME_OUT";
  const sessionStr = column.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  await logActivityController({
    databaseId: studentId,
    ojtId,
    action,
    targetType: "DTR",
    targetId: studentId,
    description: `${sessionStr} recorded`,
  });

  const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return res.status(200).json({
    message: "Attendance recorded",
    session: column,
    time,
  });
};

export const getSupervisorAttendanceController = async (req, res) => {
  const data = validate(res, supervisorAttendanceSchema, req.params);
  if (!data) return;

  const { supervisorId } = data;

  const rows = await fetchOrFail(res, getSupervisorAttendanceRows, [supervisorId], "No attendance records found");
  if (!rows) return;

  const result = [];
  let currentStudentId = null;
  let currentStudent = null;

  for (const row of rows) {
    if (row.studentId !== currentStudentId) {
      if (currentStudent) result.push(currentStudent);
      currentStudentId = row.studentId;
      currentStudent = {
        id: row.studentId,
        studentName: row.studentName.replace(/\s+/g, ' ').trim(),
        dtr: []
      };
    }
    currentStudent.dtr.push({
      id: row.attendanceId,
      date: row.date,
      morningIn: row.morningIn,
      morningOut: row.morningOut,
      afternoonIn: row.afternoonIn,
      afternoonOut: row.afternoonOut,
      hours: Number(row.totalHours) || 0,
    });
  }
  if (currentStudent) result.push(currentStudent);

  res.status(200).json(result);
};