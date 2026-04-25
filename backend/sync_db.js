import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  await db.query(`
    INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
      ('current_academic_year', '2024-2025'),
      ('current_term', '1st'),
      ('year_2_required_hours', '300'),
      ('year_2_start_date', '2024-01-01'),
      ('year_2_end_date', '2024-05-31'),
      ('year_4_required_hours', '600'),
      ('year_4_start_date', '2024-01-01'),
      ('year_4_end_date', '2024-05-31');
  `);
  console.log("Settings table created and seeded.");
  process.exit(0);
}
run();
