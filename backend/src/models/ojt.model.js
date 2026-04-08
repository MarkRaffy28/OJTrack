import { db } from "../config/db.js";

export const getStudentOjts = async (databaseId) => {
  const [rows] = await db.query(
    `
      SELECT 
        so.id,
        so.academic_year AS academicYear,
        so.term,
        so.required_hours AS requiredHours,
        so.rendered_hours AS renderedHours,
        so.status,
        o.name AS officeName
      FROM student_ojt so
      JOIN offices o ON so.office_id = o.id
      WHERE so.student_id = ?
      ORDER BY so.academic_year DESC
    `, 
    [databaseId]
  );

  return rows || null;
};

export const getSupervisorStudentsOjts = async (databaseId) => {
  const [rows] = await db.query(
    `
      SELECT 
        u.id,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.extension_name) AS fullName,
        u.profile_picture AS profilePicture,
        so.id AS ojtId,
        so.student_id AS studentId,
        so.academic_year AS academicYear,
        so.term,
        so.required_hours AS requiredHours,
        so.rendered_hours AS renderedHours,
        so.status,
        so.start_date AS startDate,
        so.end_date AS endDate,
        so.supervisor_notes AS supervisorNotes,
        sd.program,
        sd.year,
        sd.section,
        o.name AS officeName,
        EXISTS (
          SELECT 1 FROM attendance a 
          WHERE a.ojt_id = so.id AND a.date = CURDATE() 
          AND (
            (a.morning_in IS NOT NULL AND a.morning_out IS NULL) 
            OR (a.afternoon_in IS NOT NULL AND a.afternoon_out IS NULL)
          )
        ) AS isActive
      FROM student_ojt so
      JOIN users u ON u.id = so.student_id
      JOIN student_details sd ON u.id = sd.student_id
      JOIN offices o ON so.office_id = o.id
      WHERE so.supervisor_id = ?
    `,
    [databaseId]
  );

  return rows || null;
};

export const updateSupervisorNotes = async (ojtId, notes) => {
  const [result] = await db.query(
    `UPDATE student_ojt SET supervisor_notes = ? WHERE id = ?`,
    [notes, ojtId]
  );
  return result.affectedRows > 0;
};

export const getOjtStudentInfo = async (ojtId) => {
  const [rows] = await db.query(
    `
      SELECT 
        so.student_id AS studentId,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.extension_name) AS fullName
      FROM student_ojt so
      JOIN users u ON so.student_id = u.id
      WHERE so.id = ?
    `,
    [ojtId]
  );
  return rows[0] || null;
};