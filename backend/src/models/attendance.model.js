import { db } from "../config/db.js"

export const getTodayAttendance = async (studentId, ojtId, date) => {
  const [rows] = await db.query(
    `SELECT * FROM attendance WHERE student_id = ? AND ojt_id = ? AND date = ?`,
    [studentId, ojtId, date]
  );

  return rows[0] || null;
};

export const insertAttendance = async (studentId, ojtId, date, column) => {
  const [result] = await db.query(
    `
      INSERT INTO attendance (student_id, ojt_id, date, ${column})
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE ${column} = NOW()
    `,
    [studentId, ojtId, date]
  );

  return result.insertId;
};

export const isStudentInOffice = async (studentId, officeId) => {
  const [rows] = await db.query(
    `
      SELECT 1
      FROM student_ojt
      WHERE student_id = ? AND office_id = ? AND status = 'ongoing'
      ORDER BY academic_year DESC
      LIMIT 1
    `,
    [studentId, officeId]
  );

  return rows.length > 0;
};

export const getSupervisorAttendanceRows = async (supervisorId) => {
  const [rows] = await db.query(
    `
      SELECT 
        u.id AS studentId,
        CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name) AS studentName,
        a.id AS attendanceId,
        DATE_FORMAT(a.date, '%Y-%m-%d') AS date,
        TIME_FORMAT(a.morning_in, '%h:%i %p') AS morningIn,
        TIME_FORMAT(a.morning_out, '%h:%i %p') AS morningOut,
        TIME_FORMAT(a.afternoon_in, '%h:%i %p') AS afternoonIn,
        TIME_FORMAT(a.afternoon_out, '%h:%i %p') AS afternoonOut,
        ROUND((
          COALESCE(TIMESTAMPDIFF(MINUTE, a.morning_in, a.morning_out), 0) +
          COALESCE(TIMESTAMPDIFF(MINUTE, a.afternoon_in, a.afternoon_out), 0)
        ) / 60.0, 2) AS totalHours
      FROM student_ojt so
      JOIN users u ON so.student_id = u.id
      JOIN attendance a ON so.id = a.ojt_id
      WHERE so.supervisor_id = ?
      ORDER BY u.id, a.date DESC
    `,
    [supervisorId]
  );
  
  return rows;
};