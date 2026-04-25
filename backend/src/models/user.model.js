import { db } from "../config/db.js";

export const deleteUserRecord = async (databaseId) => {
  const [result] = await db.query(`UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [databaseId]);
  return result.affectedRows > 0;
};

export const findUserByDatabaseId = async (databaseId) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE id = ? AND deleted_at IS NULL",
    [databaseId]
  );

  return rows[0] || null;
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email_address = ? AND deleted_at IS NULL",
    [email]
  );

  return rows[0] || null;
};

export const findUserByUserId = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE user_id = ? AND deleted_at IS NULL",
    [userId]
  );

  return rows[0] || null;
};

export const findUserByUsername = async (username) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ? AND deleted_at IS NULL",
    [username]
  );

  return rows[0] || null;
};

export const getAdminDashboardStats = async (cohort) => {
  let cohortStr = '';
  let cohortStrStudent = '';
  let queryParams = [];

  if (cohort && cohort !== 'all') {
    const [academicYear, term] = cohort.split('|');
    if (academicYear && term) {
      cohortStr = ` AND id IN (SELECT student_id FROM student_ojt WHERE academic_year = ? AND term = ?)`;
      cohortStrStudent = ` AND student_id IN (SELECT student_id FROM student_ojt WHERE academic_year = ? AND term = ?)`;
      queryParams.push(academicYear, term);
    }
  }

  const [[totals]] = await db.query(
    `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student' AND deleted_at IS NULL ${cohortStr}) AS totalTrainees,
        (SELECT COUNT(*) FROM reports WHERE status = 'pending' AND deleted_at IS NULL ${cohortStrStudent}) AS pendingReports,
        (
          SELECT COUNT(DISTINCT student_id)
          FROM attendance
          WHERE date = CURDATE()
            AND (morning_in IS NOT NULL OR afternoon_in IS NOT NULL)
            ${cohortStrStudent}
        ) AS presentToday
    `,
    [...queryParams, ...queryParams, ...queryParams]
  );

  return totals || null;
};

export const getAdminProfile = async (databaseId) => {
  const [rows] = await db.query(
    `
      SELECT 
        u.id AS databaseId,
        u.username,
        u.profile_picture AS profilePicture,
        u.first_name AS firstName,
        u.middle_name AS middleName,
        u.last_name AS lastName,
        u.extension_name AS extensionName,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.extension_name) AS fullName,
        u.user_id AS userId,
        u.birth_date AS birthDate,
        u.gender,
        u.address,
        u.contact_number AS contactNumber,
        u.email_address AS emailAddress,
        (u.email_verified_at IS NOT NULL) AS isEmailVerified,
        u.role
      FROM users u
      WHERE u.id = ? AND u.role = 'admin' AND u.deleted_at IS NULL
    `,
    [databaseId]
  );

  const user = rows[0];

  return {
    ...user,
    isEmailVerified: Boolean(user.isEmailVerified)
  } || null;
}

export const getAdminRecentActivities = async (limit = 5) => {
  const [rows] = await db.query(
    `
      SELECT
        a.id,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.extension_name) AS fullName,
        a.action,
        a.target_type AS targetType,
        a.description,
        a.created_at AS createdAt
      FROM activity a
      LEFT JOIN users u ON u.id = a.database_id
      ORDER BY a.created_at DESC
      LIMIT ?
    `,
    [limit]
  );

  return rows || [];
};

export const getAllAdmins = async () => {
  const [rows] = await db.query(
    `
      SELECT 
        u.id,
        u.user_id AS adminId,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.extension_name) AS fullName,
        u.profile_picture AS profilePicture,
        u.created_at AS createdAt,
        u.username,
        u.email_address AS emailAddress
      FROM users u
      WHERE u.role = 'admin' AND u.deleted_at IS NULL
      ORDER BY u.last_name ASC, u.first_name ASC
    `
  );
  
  return rows || [];
};

export const getAllSupervisors = async () => {
  const [rows] = await db.query(
    `
      SELECT 
        u.id,
        u.user_id AS employeeId,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.extension_name) AS fullName,
        u.profile_picture AS profilePicture,
        u.created_at AS createdAt,
        sd.position,
        o.name AS officeName,
        o.id AS officeId
      FROM users u
      JOIN supervisor_details sd ON u.id = sd.supervisor_id
      JOIN offices o ON sd.office_id = o.id
      WHERE u.role = 'supervisor' AND u.deleted_at IS NULL
      ORDER BY u.last_name ASC, u.first_name ASC
    `
  );

  return rows || [];
};

export const getStudentProfile = async (databaseId) => {
  const [rows] = await db.query(
    `
      SELECT 
        u.id AS databaseId,
        u.username,
        u.profile_picture AS profilePicture,
        u.first_name AS firstName,
        u.middle_name AS middleName,
        u.last_name AS lastName,
        u.extension_name AS extensionName,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.extension_name) AS fullName,
        u.user_id AS userId,
        u.birth_date AS birthDate,
        u.gender,
        u.address,
        u.contact_number AS contactNumber,
        u.email_address AS emailAddress,
        (u.email_verified_at IS NOT NULL) AS isEmailVerified,
        u.role,
        s.year,
        s.program,
        s.major,
        s.section
      FROM users u
      JOIN student_details s ON u.id = s.student_id
      WHERE u.id = ? AND u.role = 'student' AND u.deleted_at IS NULL
    `,
    [databaseId]
  );

  const user = rows[0];

  return {
    ...user,
    isEmailVerified: Boolean(user.isEmailVerified)
  } || null;
};

export const getSupervisorProfile = async (databaseId) => {
  const [rows] = await db.query(
    `
      SELECT 
        u.id AS databaseId,
        u.username,
        u.profile_picture AS profilePicture,
        u.first_name AS firstName,
        u.middle_name AS middleName,
        u.last_name AS lastName,
        u.extension_name AS extensionName,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.extension_name) AS fullName,
        u.user_id AS userId,
        u.birth_date AS birthDate,
        u.gender,
        u.address,
        u.contact_number AS contactNumber,
        u.email_address AS emailAddress,
        (u.email_verified_at IS NOT NULL) AS isEmailVerified,
        u.role,
        s.office_id AS officeId,
        o.name AS officeName,
        s.position
      FROM users u
      JOIN supervisor_details s ON u.id = s.supervisor_id
      JOIN offices o ON s.office_id = o.id
      WHERE u.id = ? AND u.role = 'supervisor' AND u.deleted_at IS NULL
    `,
    [databaseId]
  );

  const user = rows[0];

  return {
    ...user,
    isEmailVerified: Boolean(user.isEmailVerified)
  } || null;
};

export const getSupervisorStats = async (supervisorId) => {
  const [statusCounts] = await db.query(
    `
      SELECT 
        status, 
        COUNT(*) as count
      FROM student_ojt
      WHERE supervisor_id = ?
      GROUP BY status
    `,
    [supervisorId]
  );

  const [[counts]] = await db.query(
    `
      SELECT 
        (
          SELECT COUNT(*) 
          FROM reports r 
          JOIN student_ojt so ON r.ojt_id = so.id 
          WHERE so.supervisor_id = ? AND r.status = 'pending'
        ) as pendingReports,
        (
          SELECT COUNT(DISTINCT so.student_id) 
          FROM attendance a 
          JOIN student_ojt so ON a.ojt_id = so.id 
          WHERE so.supervisor_id = ? AND a.date = CURDATE()
          AND (
            (a.morning_in IS NOT NULL AND a.morning_out IS NULL) 
            OR (a.afternoon_in IS NOT NULL AND a.afternoon_out IS NULL)
          )
        ) as activeToday
    `,
    [supervisorId, supervisorId]
  );

  return {
    statusCounts,
    pendingReports: counts.pendingReports,
    activeToday: counts.activeToday
  };
};

export const updateAdminUserProfile = async (data, databaseId, shouldResetVerification = false) => {
  const { 
    username, profilePicture, firstName, middleName, lastName, extensionName, adminId, birthDate, gender, address, 
    contactNumber, email
  } = data;

  await db.query(
    `
      UPDATE users SET 
        username =?,
        profile_picture =?,
        first_name =?,
        middle_name =?,
        last_name =?,
        extension_name =?,
        user_id =?,
        birth_date =?,
        gender =?,
        address =?,
        contact_number =?,
        email_address =?
        ${shouldResetVerification ? ', email_verified_at = NULL' : ''}
      WHERE id = ?
    `,
    [username, profilePicture, firstName, middleName, lastName, extensionName, adminId, birthDate, gender, address, contactNumber, email, databaseId]
  );
};

export const updateStudentUserProfile = async (data, databaseId, shouldResetVerification = false) => {
  const { 
    username, profilePicture, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, 
    contactNumber, email, year, program, major, section
  } = data;

  await db.query(
    `
      UPDATE users SET 
        username =?,
        profile_picture =?,
        first_name =?,
        middle_name =?,
        last_name =?,
        extension_name =?,
        user_id =?,
        birth_date =?,
        gender =?,
        address =?,
        contact_number =?,
        email_address =?
        ${shouldResetVerification ? ', email_verified_at = NULL' : ''}
      WHERE id = ?
    `,
    [username, profilePicture, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, 
    contactNumber, email, databaseId]
  );

  await db.query(
    `
      UPDATE student_details SET
        year = ?,
        program = ?,
        major = ?,
        section = ?
      WHERE student_id = ?
    `,
    [year, program, major, section, databaseId]
  );
};

export const updateSupervisorUserProfile = async (data, databaseId, shouldResetVerification = false) => {
  const { 
    username, profilePicture, firstName, middleName, lastName, extensionName, employeeId, birthDate, gender, address, 
    contactNumber, email, officeId, position
  } = data;

  await db.query(
    `
      UPDATE users SET 
        username =?,
        profile_picture =?,
        first_name =?,
        middle_name =?,
        last_name =?,
        extension_name =?,
        user_id =?,
        birth_date =?,
        gender =?,
        address =?,
        contact_number =?,
        email_address =?
        ${shouldResetVerification ? ', email_verified_at = NULL' : ''}
      WHERE id = ?
    `,
    [username, profilePicture, firstName, middleName, lastName, extensionName, employeeId, birthDate, gender, address, contactNumber, email, databaseId]
  );

  await db.query(
    `
      UPDATE supervisor_details SET
        office_id = ?,
        position = ?
      WHERE supervisor_id = ?
    `,
    [officeId, position, databaseId]
  );
};

export const updateUserPassword = async (newPassword, databaseId) => {
  await db.query(
    `UPDATE users SET password = ? WHERE id = ?`,
    [newPassword, databaseId]
  );
};