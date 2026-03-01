const db = require("../config/db");

exports.findByUsername = async (username) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  return rows[0];
};

exports.findByUserId = async(userId) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId]
  );
  return rows[0];
}

exports.findByEmail = async(email) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email_address = ?",
    [email]
  );
  return rows[0];
}

exports.createStudentUser = async (data) => {
  const { username, password, profilePhoto, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, contactNumber, email, year, program, major
  } = data;
  const [userResult] = await db.query(
    "INSERT INTO users(username, password, profile_picture, first_name, middle_name, last_name, extension_name, user_id, birth_date, gender, address, contact_number, email_address, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [username, password, profilePhoto, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, contactNumber, email, 'user']
  );

  internalID = userResult.insertId;

  const [result] = await db.query(
    "INSERT INTO user_details(user_id, year, program, major) VALUES(?, ?, ?, ?)",
    [internalID, year, program, major]
  );

  return internalID;
}

exports.createSupervisorUser = async (data) => {
  const { username, password, profilePhoto, firstName, middleName, lastName, extensionName, employeeId, birthDate, gender, address, contactNumber, email, officeId
  } = data;
  const [userResult] = await db.query(
    "INSERT INTO users(username, password, profile_picture, first_name, middle_name, last_name, extension_name, user_id, birth_date, gender, address, contact_number, email_address, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [username, password, profilePhoto, firstName, middleName, lastName, extensionName, employeeId, birthDate, gender, address, contactNumber, email, 'supervisor']
  );

  internalID = userResult.insertId;

  const [result] = await db.query(
    "INSERT INTO supervisor_details(supervisor_id, office_id) VALUES(?, ?)",
    [internalID, officeId]
  );

  return internalID;
}