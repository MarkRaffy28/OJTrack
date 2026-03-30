import { db } from "../config/db.js"

export const getTodayAttendance = async (studentId, ojtId, date) => {
  const [rows] = await db.query(
    `SELECT * FROM attendance WHERE student_id = ? AND ojt_id = ? AND date = ?`,
    [studentId, ojtId, date]
  );

  return rows[0];
}

export const insertAttendance = async (studentId, ojtId, date, column) => {
  const [rows] = await db.query(
    `
      INSERT INTO attendance (student_id, ojt_id, date, ${column})
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE ${column} = NOW()
    `,
    [studentId, ojtId, date]
  );

  return rows[0];
}

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
}