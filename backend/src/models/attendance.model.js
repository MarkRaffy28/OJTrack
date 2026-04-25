import { db } from "../config/db.js"

export const getAllAttendanceRows = async () => {
  const [rows] = await db.query(`
    SELECT 
      u.id AS studentId,
      u.user_id AS userId,
      u.profile_picture AS profilePicture,
      CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name) AS studentName,
      a.id AS attendanceId,
      a.date AS date,
      TIME_FORMAT(a.morning_in, '%h:%i %p') AS morningIn,
      TIME_FORMAT(a.morning_out, '%h:%i %p') AS morningOut,
      TIME_FORMAT(a.afternoon_in, '%h:%i %p') AS afternoonIn,
      TIME_FORMAT(a.afternoon_out, '%h:%i %p') AS afternoonOut,
      ROUND((
        COALESCE(TIMESTAMPDIFF(MINUTE, a.morning_in, a.morning_out), 0) +
        COALESCE(TIMESTAMPDIFF(MINUTE, a.afternoon_in, a.afternoon_out), 0)
      ) / 60.0, 2) AS totalHours
    FROM attendance a
    JOIN users u ON a.student_id = u.id
    WHERE u.deleted_at IS NULL
    ORDER BY a.date DESC, u.last_name ASC
  `);

  return rows;
};

export const getAttendanceByIdRow = async (attendanceId) => {
  const [rows] = await db.query(`
    SELECT 
      u.id AS studentId,
      u.user_id AS userId,
      u.profile_picture AS profilePicture,
      CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name) AS studentName,
      o.name AS officeName,
      CONCAT(s.first_name, ' ', s.last_name) AS supervisorName,
      a.id AS attendanceId,
      a.date AS date,
      TIME_FORMAT(a.morning_in, '%h:%i %p') AS morningIn,
      TIME_FORMAT(a.morning_out, '%h:%i %p') AS morningOut,
      TIME_FORMAT(a.afternoon_in, '%h:%i %p') AS afternoonIn,
      TIME_FORMAT(a.afternoon_out, '%h:%i %p') AS afternoonOut,
      ROUND((
        COALESCE(TIMESTAMPDIFF(MINUTE, a.morning_in, a.morning_out), 0) +
        COALESCE(TIMESTAMPDIFF(MINUTE, a.afternoon_in, a.afternoon_out), 0)
      ) / 60.0, 2) AS totalHours
    FROM attendance a
    JOIN users u ON a.student_id = u.id
    LEFT JOIN student_ojt so ON a.ojt_id = so.id
    LEFT JOIN offices o ON so.office_id = o.id
    LEFT JOIN users s ON so.supervisor_id = s.id
    WHERE a.id = ? AND u.deleted_at IS NULL AND (so.deleted_at IS NULL OR so.id IS NULL)
  `, [attendanceId]);

  return rows[0] || null;
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
      WHERE so.supervisor_id = ? AND so.deleted_at IS NULL AND u.deleted_at IS NULL
      ORDER BY u.id, a.date DESC
    `,
    [supervisorId]
  );
  
  return rows;
};

export const getStudentAttendanceRows = async (studentId, ojtId) => {
  const [rows] = await db.query(
    `
      SELECT 
        id AS attendanceId,
        date,
        TIME_FORMAT(morning_in, '%h:%i %p') AS morningIn,
        TIME_FORMAT(morning_out, '%h:%i %p') AS morningOut,
        TIME_FORMAT(afternoon_in, '%h:%i %p') AS afternoonIn,
        TIME_FORMAT(afternoon_out, '%h:%i %p') AS afternoonOut,
        ROUND((
          COALESCE(TIMESTAMPDIFF(MINUTE, morning_in, morning_out), 0) +
          COALESCE(TIMESTAMPDIFF(MINUTE, afternoon_in, afternoon_out), 0)
        ) / 60.0, 2) AS totalHours
      FROM attendance
      WHERE student_id = ? AND ojt_id = ?
      ORDER BY date DESC
    `,
    [studentId, ojtId]
  );

  return rows;
};

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
      WHERE student_id = ? AND office_id = ? AND status IN ('ongoing', 'pending') AND deleted_at IS NULL
      ORDER BY academic_year DESC
      LIMIT 1
    `,
    [studentId, officeId]
  );

  return rows.length > 0;
};
