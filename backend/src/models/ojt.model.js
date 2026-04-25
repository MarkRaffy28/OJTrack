import { db } from "../config/db.js";

export const createOjtRecord = async (data) => {
  let { studentId, academicYear, term, requiredHours, startDate, endDate, officeId, supervisorId, status } = data;

  if (supervisorId) {
    const [supRows] = await db.query(
      `SELECT office_id FROM supervisor_details WHERE supervisor_id = ?`,
      [supervisorId]
    );
    if (supRows.length > 0) {
      officeId = supRows[0].office_id;
    }
  }

  const [result] = await db.query(
    `INSERT INTO student_ojt (student_id, academic_year, term, required_hours, start_date, end_date, office_id, supervisor_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [studentId, academicYear, term, requiredHours, startDate, endDate, officeId || null, supervisorId || null, status || 'pending']
  );
  
  return result.insertId;
};

export const deleteOjtRecord = async (ojtId) => {
  const [result] = await db.query(`UPDATE student_ojt SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [ojtId]);
  return result.affectedRows > 0;
};

export const getAdminStudentsOjts = async () => {
  const [rows] = await db.query(
    `
      SELECT
        u.id AS databaseId,
        u.user_id AS traineeId,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.extension_name) AS fullName,
        u.profile_picture AS profilePicture,
        latest_ojt.id AS ojtId,
        latest_ojt.start_date AS startDate,
        latest_ojt.end_date AS endDate,
        latest_ojt.status,
        latest_ojt.academic_year AS academicYear,
        latest_ojt.term,
        latest_ojt.required_hours AS requiredHours,
        latest_ojt.rendered_hours AS renderedHours,
        latest_ojt.supervisor_id AS supervisorId,
        o.id AS officeId,
        o.name AS officeName
      FROM users u
      LEFT JOIN student_ojt latest_ojt ON latest_ojt.id = (
        SELECT so.id
        FROM student_ojt so
        WHERE so.student_id = u.id AND so.deleted_at IS NULL
        ORDER BY so.start_date DESC, so.id DESC
        LIMIT 1
      )
      LEFT JOIN offices o ON o.id = latest_ojt.office_id
      WHERE u.role = 'student' AND u.deleted_at IS NULL
      ORDER BY u.last_name ASC, u.first_name ASC
    `
  );

  return rows || [];
};

export const getStudentOjts = async (databaseId) => {
  const [rows] = await db.query(
    `
      SELECT 
        so.id,
        so.office_id AS officeId,
        so.supervisor_id AS supervisorId,
        so.supervisor_notes AS supervisorNotes,
        so.academic_year AS academicYear,
        so.term,
        so.required_hours AS requiredHours,
        so.rendered_hours AS renderedHours,
        so.status,
        so.start_date AS startDate,
        so.end_date AS endDate,
        o.name AS officeName,
        CONCAT_WS(' ', su.first_name, su.middle_name, su.last_name, su.extension_name) AS supervisorName,
        spd.position AS supervisorPosition
      FROM student_ojt so
      LEFT JOIN offices o ON so.office_id = o.id
      LEFT JOIN users su ON so.supervisor_id = su.id
      LEFT JOIN supervisor_details spd ON su.id = spd.supervisor_id
      WHERE so.student_id = ? AND so.deleted_at IS NULL
      ORDER BY so.academic_year DESC
    `, 
    [databaseId]
  );

  return rows || null;
};

export const getOjtStudentInfo = async (ojtId) => {
  const [rows] = await db.query(
    `
      SELECT 
        so.student_id AS studentId,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.extension_name) AS fullName
      FROM student_ojt so
      JOIN users u ON so.student_id = u.id
      WHERE so.id = ? AND so.deleted_at IS NULL AND u.deleted_at IS NULL
    `,
    [ojtId]
  );
  return rows[0] || null;
};

export const getSupervisorStudentsOjts = async (databaseId) => {
  const [rows] = await db.query(
    `
      SELECT 
        u.id,
        u.user_id AS userId,
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
      WHERE so.supervisor_id = ? AND so.deleted_at IS NULL AND u.deleted_at IS NULL
    `,
    [databaseId]
  );

  return rows || null;
};

export const recalculateRenderedHours = async (ojtId) => {
  const [result] = await db.query(
    `
      UPDATE student_ojt so
      SET rendered_hours = (
        SELECT COALESCE(SUM(ROUND((
          COALESCE(TIMESTAMPDIFF(MINUTE, morning_in, morning_out), 0) +
          COALESCE(TIMESTAMPDIFF(MINUTE, afternoon_in, afternoon_out), 0)
        ) / 60.0, 2)), 0)
        FROM attendance
        WHERE ojt_id = so.id
      )
      WHERE so.id = ? AND so.deleted_at IS NULL
    `,
    [ojtId]
  );
  
  return result.affectedRows > 0;
};

export const startOjtIfPending = async (ojtId) => {
  const [result] = await db.query(
    `UPDATE student_ojt SET status = 'ongoing' WHERE id = ? AND status = 'pending' AND deleted_at IS NULL`,
    [ojtId]
  );
  
  return result.affectedRows > 0;
};

export const updateOjtRecord = async (ojtId, data) => {
  let { officeId, supervisorId, requiredHours, renderedHours, status, startDate, endDate, academicYear, term } = data;

  if (supervisorId) {
    const [supRows] = await db.query(
      `SELECT office_id FROM supervisor_details WHERE supervisor_id = ?`,
      [supervisorId]
    );
    if (supRows.length > 0) {
      officeId = supRows[0].office_id;
    }
  }

  const [result] = await db.query(
    `
      UPDATE student_ojt SET
        office_id = ?,
        supervisor_id = ?,
        required_hours = ?,
        rendered_hours = ?,
        status = ?,
        start_date = ?,
        end_date = ?,
        academic_year = ?,
        term = ?
      WHERE id = ?
    `,
    [officeId, supervisorId, requiredHours, renderedHours, status, startDate, endDate, academicYear, term, ojtId]
  );
  
  return result.affectedRows > 0;
};

export const updateOjtSupervisor = async (ojtId, supervisorId) => {
  let query = `UPDATE student_ojt SET supervisor_id = ? WHERE id = ?`;
  let params = [supervisorId, ojtId];
  
  if (supervisorId) {
    query = `
      UPDATE student_ojt so
      SET 
        so.supervisor_id = ?,
        so.office_id = (SELECT office_id FROM supervisor_details WHERE supervisor_id = ?)
      WHERE so.id = ?
    `;
    params = [supervisorId, supervisorId, ojtId];
  }

  const [result] = await db.query(query, params);
  return result.affectedRows > 0;
};

export const updateSupervisorNotes = async (ojtId, notes) => {
  const [result] = await db.query(
    `UPDATE student_ojt SET supervisor_notes = ? WHERE id = ?`,
    [notes, ojtId]
  );
  return result.affectedRows > 0;
};