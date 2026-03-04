const db = require("../config/db");

exports.createStudentUser = async (data) => {
  const { username, password, profilePhoto, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, contactNumber, email, year, program, major
  } = data;
  const [userResult] = await db.query(
    "INSERT INTO users(username, password, profile_picture, first_name, middle_name, last_name, extension_name, user_id, birth_date, gender, address, contact_number, email_address, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [username, password, profilePhoto, firstName, middleName, lastName, extensionName, studentId, birthDate, gender, address, contactNumber, email, 'student']
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

exports.fetchStudentInformation = async(userId) => {
  const [rows] = await db.query(
    `SELECT 
      u.id AS databaseId,
      u.username,
      u.profile_picture AS profilePicture,
      u.first_name AS firstName,
      u.middle_name AS middleName,
      u.last_name AS lastName,
      u.extension_name AS extensionName,
      u.user_id AS userId,
      u.birth_date AS birthDate,
      u.gender,
      u.address,
      u.contact_number AS contactNumber,
      u.email_address AS emailAddress,
      u.role,
      s.year,
      s.program,
      s.major
    FROM users u
    JOIN student_details s ON u.id = s.user_id
    WHERE u.id = ? AND u.role = 'student'`,
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

exports.findByUserId = async(userId) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId]
  );
  return rows[0];
}

exports.findByUsername = async (username) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  return rows[0];
};