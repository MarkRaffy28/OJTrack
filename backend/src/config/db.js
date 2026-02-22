const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully via Pool");
    connection.release(); // Crucial: release the connection back to the pool!
  })
  .catch((err) => {
    console.log("Database connection failed:", err.message);
  }); 

module.exports = db;
