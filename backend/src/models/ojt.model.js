import { db } from "../config/db.js";

export const fetchStudentOjts = async (databaseId) => {
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

export const fetchSupervisorStudentsOjts = async (databaseId) => {
  const [rows] = await db.query(
    `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        so.id AS ojtId,
        so.student_id AS studentId,
        so.academic_year AS academicYear,
        so.term,
        so.required_hours AS requiredHours,
        so.rendered_hours AS renderedHours,
        so.status,
        so.start_date AS startDate,
        so.end_date AS endDate
      FROM student_ojt so
      JOIN users u ON u.id = so.student_id
      WHERE so.supervisor_id = ?
    `,
    [databaseId]
  );

  return rows || null;
};