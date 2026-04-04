import { db } from "../config/db.js";

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
      WHERE u.id = ? AND u.role = 'student'
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
      WHERE u.id = ? AND u.role = 'supervisor'
    `,
    [databaseId]
  );

  const user = rows[0];

  return {
    ...user,
    isEmailVerified: Boolean(user.isEmailVerified)
  } || null;
};

export const findUserByDatabaseId = async (databaseId) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE id = ?",
    [databaseId]
  );

  return rows[0] || null;
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email_address = ?",
    [email]
  );

  return rows[0] || null;
};

export const findUserByUserId = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId]
  );

  return rows[0] || null;
};

export const findUserByUsername = async (username) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  return rows[0] || null;
};

export const updateStudentUserProfile = async (data, databaseId) => {
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

export const updateSupervisorUserProfile = async (data, databaseId) => {
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