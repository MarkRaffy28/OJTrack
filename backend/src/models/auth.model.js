import { db } from "../config/db.js";

export const createStudentUser = async (data) => {
  const { 
    username, password, profilePicture, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, 
    contactNumber, email, year, program, major, section
  } = data;

  const [userResult] = await db.query(
    "INSERT INTO users(username, password, profile_picture, first_name, middle_name, last_name, extension_name, user_id, birth_date, gender, address, contact_number, email_address, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [username, password, profilePicture, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, contactNumber, email, 'student']
  );

  const internalID = userResult.insertId;

  await db.query(
    "INSERT INTO student_details(student_id, year, program, major, section) VALUES(?, ?, ?, ?, ?)",
    [internalID, year, program, major, section]
  );

  return internalID;
};

export const createSupervisorUser = async (data) => {
  const { 
    username, password, profilePicture, firstName, middleName, lastName, extensionName, employeeId, birthDate, gender, address,
    contactNumber, email, officeId, position
  } = data;

  const [userResult] = await db.query(
    "INSERT INTO users(username, password, profile_picture, first_name, middle_name, last_name, extension_name, user_id, birth_date, gender, address, contact_number, email_address, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [username, password, profilePicture, firstName, middleName, lastName, extensionName, employeeId, birthDate, gender, address, contactNumber, email, 'supervisor']
  );

  const internalID = userResult.insertId;

  await db.query(
    "INSERT INTO supervisor_details(supervisor_id, office_id, position) VALUES(?, ?, ?)",
    [internalID, officeId, position]
  );

  return internalID;
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