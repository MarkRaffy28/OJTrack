import { treeifyError } from "zod";
import { logActivityController } from "./activity.controller.js";
import { getTodayAttendance, insertAttendance, isStudentInOffice } from "../models/attendance.model.js";
import { determineSession, verifyQr } from "../utils/attendance.js";
import { attendanceQuerySchema, scanAttendanceSchema } from "../validators/attendance.validator.js";


export const getTodayAttendanceController = async (req, res) => {
  try {
    const parsed = attendanceQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { studentId, ojtId, date } = parsed.data;

    const dbRecord = await getTodayAttendance(studentId, ojtId, date);
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

export const scanAttendanceController = async (req, res) => {
  try {
    const parsed = scanAttendanceSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }
    const { studentId, ojtId, qrPayLoad } = parsed.data;

    try {
      verifyQr(qrPayLoad.o, qrPayLoad.t, qrPayLoad.s);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const assigned = await isStudentInOffice(studentId, qrPayLoad.o);
    if (!assigned) {
      return res.status(403).json({ message: "Student not assigned to this office" });
    }

    let column;
    try {
      column = determineSession();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

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
    }

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

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};