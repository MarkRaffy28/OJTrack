import { db } from "../config/db.js";

export const createStudentUser = async (data) => {
  const { 
    username, password, profilePicture, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, 
    contactNumber, email, year, program, major
  } = data;

  const [userResult] = await db.query(
    "INSERT INTO users(username, password, profile_picture, first_name, middle_name, last_name, extension_name, user_id, birth_date, gender, address, contact_number, email_address, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [username, password, profilePicture, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, contactNumber, email, 'student']
  );

  internalID = userResult.insertId;

  await db.query(
    "INSERT INTO student_details(user_id, year, program, major) VALUES(?, ?, ?, ?)",
    [internalID, year, program, major]
  );

  return internalID;
}

export const createSupervisorUser = async (data) => {
  const { 
    username, password, profilePicture, firstName, middleName, lastName, extensionName, employeeId, birthDate, gender, address,
    contactNumber, email, officeId
  } = data;

  const [userResult] = await db.query(
    "INSERT INTO users(username, password, profile_picture, first_name, middle_name, last_name, extension_name, user_id, birth_date, gender, address, contact_number, email_address, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [username, password, profilePicture, firstName, middleName, lastName, extensionName, employeeId, birthDate, gender, address, contactNumber, email, 'supervisor']
  );

  internalID = userResult.insertId;

  await db.query(
    "INSERT INTO supervisor_details(supervisor_id, office_id) VALUES(?, ?)",
    [internalID, officeId]
  );

  return internalID;
}

export const fetchStudentProfile = async (userId) => {
  const [rows] = await db.query(
    `SELECT 
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
      s.major
    FROM users u
    JOIN student_details s ON u.id = s.user_id
    WHERE u.id = ? AND u.role = 'student'`,
    [userId]
  );

  const user = rows[0];

  return {
    ...user,
    isEmailVerified: Boolean(user.isEmailVerified)
  };
}

export const fetchStudentOjts = async (userId) => {
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
    [userId]
  );
  return rows;
}

export const findUserByDatabaseId = async (databaseId) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE id = ?",
    [databaseId]
  );
  return rows[0];
}

export const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email_address = ?",
    [email]
  );
  return rows[0];
}

export const findUserByUserId = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId]
  );
  return rows[0];
}

export const findUserByUsername = async (username) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  return rows[0];
};

export const markEmailVerified = async (email) => {
  await db.query(
    `UPDATE users SET 
        email_verified_at = NOW(), 
        email_verification_token = NULL, 
        email_verification_expires = NULL 
      WHERE email_address = ?`,
    [email]
  );
};

export const resetUserPassword = async (email, newPassword) => {
  await db.query(
    `UPDATE users SET 
        password = ?, 
        password_reset_token = NULL, 
        password_reset_expires = NULL
      WHERE email_address = ?`,
    [newPassword, email]
  );
};

export const saveForgotPasswordOTP = async (email, hashedOTP, expires) => {
  await db.query(
    `UPDATE users SET
        password_reset_token = ?,
        password_reset_expires = ? 
      WHERE email_address = ?`,
    [hashedOTP, expires, email]
  );
};

export const saveVerificationOTP = async (email, hashedOTP, expires) => {
  await db.query(
    `UPDATE users SET 
        email_verification_token = ?, 
        email_verification_expires = ? 
      WHERE email_address = ?`,
    [hashedOTP, expires, email]
  );
};

export const updateStudentUserProfile = async (data, databaseId) => {
  const { 
    username, profilePicture, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, 
    contactNumber, email, year, program, major
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
        major =?
      WHERE user_id = ?
    `,
    [year, program, major, databaseId]
  );
};

export const updateUserPassword = async (newPassword, databaseId) => {
  await db.query(
    `UPDATE users SET password = ? WHERE id = ?`,
    [newPassword, databaseId]
  );
};