const db = require("../config/db");

exports.findByUsername = async (username) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  return rows[0];
};


exports.createStudentUser = async (
  username, 
  hashedPassword, 
  firstName, 
  middleName, 
  lastName, 
  extensionName,
  studentID,
  birthDate,
  gender,
  address,
  contactNumber,
  email,
  yearLevel,
  program,
  major
) => {
  const [userResult] = await db.query(
    "INSERT INTO users(username, password, first_name, middle_name, last_name, extension_name, user_id, birth_date, gender, address,  contact_number, email_address, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [username, hashedPassword, firstName, middleName, lastName, extensionName, studentID, birthDate, gender, address, contactNumber, email, 'user']
  );

  internalID = userResult.insertId;

  const [result] = await db.query(
    "INSERT INTO user_details(user_id, year, program, major) VALUES(?, ?, ?, ?)",
    [internalID, program, yearLevel, major]
  );

  return internalID;
}