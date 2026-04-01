import { treeifyError } from "zod";
import { logActivity } from "./activity.controller.js";
import { 
  getTodayAttendance as _getTodayAttendance, insertAttendance, isStudentInOffice 
} from "../models/attendance.model.js";
import { determineSession, verifyQr } from "../utils/attendance.js";
import { attendanceQuerySchema } from "../validators/attendance.validator.js";


export const getTodayAttendance = async (req, res) => {
  try {
    const parsed = attendanceQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { studentId, ojtId, date } = parsed.data;

    const dbRecord = await _getTodayAttendance(studentId, ojtId, date);
    const record = {
      morningTimeIn: dbRecord?.morning_in ?? '',
      morningTimeOut: dbRecord?.morning_out ?? '',
      afternoonTimeIn: dbRecord?.afternoon_in ?? '',
      afternoonTimeOut: dbRecord?.afternoon_out ?? '',
    };

    return res.status(200).json(record);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

export const scanAttendance = async (req, res) => {
  try {
    const { studentId, ojtId, qrPayLoad } = req.body;
    
    if (!studentId || !ojtId || !qrPayLoad) {
      return res.status(400).json({  message: "Invalid request data" });
    }

    let qr;
    try {
      qr = typeof qrPayLoad === "string" ? JSON.parse(qrPayLoad) : qrPayLoad;
    } catch {
      return res.status(400).json({ message: "Invalid QR payload format" });
    }

    if (!qr.o || !qr.t || !qr.s) {
      return res.status(400).json({ message: "Invalid QR payload" });
    }

    try {
      verifyQr(qr.o, qr.t, qr.s);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const assigned = await isStudentInOffice(studentId, qr.o);
    if (!assigned) {
      return res.status(403).json({ message: "Student not assigned to this office" });
    }

    let column;
    try {
      column = determineSession();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const date = new Date().toISOString().slice(0, 10);

    const record = await _getTodayAttendance(studentId, ojtId, date);
    if ((column === "morning_out" && (!record || !record["morning_in"])) ||
        (column === "afternoon_out" && (!record || !record["afternoon_in"]))) {
      return res.status(400).json({
        message: `Cannot log ${column.includes("morning") ? "Morning Time Out" : "Afternoon Time Out"} without logging ${column.includes("morning") ? "Morning Time In" : "Afternoon Time In"}`
      });
    }

    if (record && record[column]) {
      return res.status(400).json({
        message: "Session already recorded"
      });
    }

    await insertAttendance(studentId, ojtId, date, column);

    const action = column.endsWith('_in') ? 'TIME_IN' : 'TIME_OUT';
    const sessionStr = column.replace('_', ' ').charAt(0).toUpperCase() + column.replace('_', ' ').slice(1);
    
    await logActivity({
      databaseId: studentId,
      ojtId,
      action,
      targetType: 'DTR',
      targetId: studentId,
      description: `${sessionStr} recorded`
    });

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    res.status(200).json({
      message: "Attendance recorded",
      session: column,
      time
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}