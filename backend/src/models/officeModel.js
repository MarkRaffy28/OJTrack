const db = require("../config/db");

exports.getOfficesList = async () => {
  const [rows] = await db.query(
    "SELECT * FROM offices"
  );
  return rows;
}