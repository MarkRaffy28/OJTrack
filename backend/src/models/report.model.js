import { db } from "../config/db.js";

export const createReport = async (data) => {
  const { studentId, ojtId, type, reportDate, title, content, attachments } = data;

  const [result] = await db.query(
    `
      INSERT INTO reports 
        (student_id, ojt_id, type, report_date, title, content, attachments)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [studentId, ojtId, type, reportDate, title, content, attachments ? JSON.stringify(attachments) : null]
  );

  return result.insertId;
};

export const deleteReport = async (reportId) => {
  await db.query(
    `UPDATE reports SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [reportId]
  );
};

export const getAllReportsAdmin = async () => {
  const [rows] = await db.query(
    `
      SELECT 
        r.id,
        r.student_id AS studentId,
        r.ojt_id AS ojtId,
        r.type,
        r.report_date AS reportDate,
        r.title,
        r.content,
        r.attachments,
        r.status,
        r.reviewed_by AS reviewedBy,
        r.reviewed_at AS reviewedAt,
        r.feedback,
        r.created_at AS createdAt,
        r.updated_at AS updatedAt,
        CONCAT(u.first_name, ' ', u.last_name) AS studentName,
        u.profile_picture AS studentProfilePicture,
        u.user_id AS traineeId,
        off.name AS officeName,
        CASE WHEN r.reviewed_by IS NOT NULL 
          THEN CONCAT(rev.first_name, ' ', rev.last_name)
          ELSE NULL 
        END AS reviewerName
      FROM reports r
      JOIN student_ojt so ON r.ojt_id = so.id
      JOIN users u ON r.student_id = u.id
      JOIN offices off ON so.office_id = off.id
      LEFT JOIN users rev ON r.reviewed_by = rev.id
      WHERE r.deleted_at IS NULL
      ORDER BY r.report_date DESC
    `
  );

  return rows.map(row => ({
    ...row,
    attachments: row.attachments ? JSON.parse(row.attachments) : null
  })) || null;
};

export const getReports = async (ojtId) => {
  const [rows] = await db.query(
    `
      SELECT 
        r.id,
        r.student_id AS studentId,
        r.ojt_id AS ojtId,
        r.type,
        r.report_date AS reportDate,
        r.title,
        r.content,
        r.attachments,
        r.status,
        r.reviewed_by AS reviewedBy,
        r.reviewed_at AS reviewedAt,
        r.feedback,
        r.created_at AS createdAt,
        r.updated_at AS updatedAt,
        CASE WHEN r.reviewed_by IS NOT NULL 
          THEN CONCAT(u.first_name, ' ', u.last_name)
          ELSE NULL 
        END AS reviewerName
      FROM reports r
      LEFT JOIN users u ON r.reviewed_by = u.id
      WHERE r.ojt_id = ? AND r.deleted_at IS NULL
      ORDER BY r.report_date DESC
    `,
    [ojtId]
  );

  return rows.map(row => ({
    ...row,
    attachments: row.attachments ? JSON.parse(row.attachments) : null
  })) || null;
};

export const getReportById = async (reportId) => {
  const [rows] = await db.query(
    `SELECT id, student_id, ojt_id, status, attachments FROM reports WHERE id = ? AND deleted_at IS NULL`,
    [reportId]
  );

  if (rows[0] && rows[0].attachments) {
    rows[0].attachments = JSON.parse(rows[0].attachments);
  }

  return rows[0] || null;
};

export const getReportByIdAdmin = async (reportId) => {
  const [rows] = await db.query(
    `
      SELECT 
        r.id,
        r.student_id AS studentId,
        r.ojt_id AS ojtId,
        r.type,
        r.report_date AS reportDate,
        r.title,
        r.content,
        r.attachments,
        r.status,
        r.reviewed_by AS reviewedBy,
        r.reviewed_at AS reviewedAt,
        r.feedback,
        r.created_at AS createdAt,
        r.updated_at AS updatedAt,
        CONCAT(u.first_name, ' ', u.last_name) AS studentName,
        u.profile_picture AS studentProfilePicture,
        u.user_id AS traineeId,
        sd.program AS course,
        sd.year AS year,
        sd.section AS section,
        off.name AS officeName,
        CASE WHEN r.reviewed_by IS NOT NULL 
          THEN CONCAT(rev.first_name, ' ', rev.last_name)
          ELSE NULL 
        END AS reviewerName
      FROM reports r
      JOIN student_ojt so ON r.ojt_id = so.id
      JOIN users u ON r.student_id = u.id
      JOIN offices off ON so.office_id = off.id
      LEFT JOIN student_details sd ON u.id = sd.student_id
      LEFT JOIN users rev ON r.reviewed_by = rev.id
      WHERE r.id = ? AND r.deleted_at IS NULL
    `,
    [reportId]
  );

  if (!rows[0]) return null;

  return {
    ...rows[0],
    attachments: rows[0].attachments ? JSON.parse(rows[0].attachments) : null
  };
};

export const updateReport = async (reportId, data) => {
  const { type, reportDate, title, content, attachments } = data;

  await db.query(
    `
      UPDATE reports SET 
        type = ?, 
        report_date = ?, 
        title = ?, 
        content = ?, 
        attachments = ?
      WHERE id = ? AND status != 'approved'
    `,
    [type, reportDate, title, content, attachments ? JSON.stringify(attachments) : null, reportId]
  );
};

export const updateReportStatus = async (reportId, status, reviewerId, feedback = null) => {
  await db.query(
    `
      UPDATE reports SET 
        status = ?, 
        reviewed_by = ?, 
        reviewed_at = CURRENT_TIMESTAMP(),
        feedback = ?
      WHERE id = ?
    `,
    [status, reviewerId, feedback, reportId]
  );
};

export const getSupervisorReports = async (supervisorId) => {
  const [rows] = await db.query(
    `
      SELECT 
        r.id,
        r.student_id AS studentId,
        r.ojt_id AS ojtId,
        r.type,
        r.report_date AS reportDate,
        r.title,
        r.content,
        r.attachments,
        r.status,
        r.reviewed_by AS reviewedBy,
        r.reviewed_at AS reviewedAt,
        r.feedback,
        r.created_at AS createdAt,
        r.updated_at AS updatedAt,
        CONCAT(u.first_name, ' ', u.last_name) AS studentName,
        u.profile_picture AS studentProfilePicture,
        CASE WHEN r.reviewed_by IS NOT NULL 
          THEN CONCAT(rev.first_name, ' ', rev.last_name)
          ELSE NULL 
        END AS reviewerName
      FROM reports r
      JOIN student_ojt so ON r.ojt_id = so.id
      JOIN users u ON r.student_id = u.id
      LEFT JOIN users rev ON r.reviewed_by = rev.id
      WHERE so.supervisor_id = ? AND r.deleted_at IS NULL
      ORDER BY r.report_date DESC
    `,
    [supervisorId]
  );

  return rows.map(row => ({
    ...row,
    attachments: row.attachments ? JSON.parse(row.attachments) : null
  })) || null;
};