import { db } from "../config/db.js";

export const createOffice = async (data) => {
  const { name, address, contact_email, contact_phone } = data;

  const [result] = await db.query(
    "INSERT INTO offices (name, address, contact_email, contact_phone) VALUES (?, ?, ?, ?)",
    [name, address, contact_email, contact_phone]
  );

  return result.insertId;
};

export const getOfficeById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM offices WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
  return rows[0] || null;
};

export const getOfficesList = async () => {
  const [rows] = await db.query(
    "SELECT * FROM offices WHERE deleted_at IS NULL"
  );

  return rows || null;
};

export const deleteOffice = async (id) => {
  const [result] = await db.query(
    "UPDATE offices SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id]
  );
  
  return result.affectedRows > 0;
};

export const updateOffice = async (id, data) => {
  const { name, address, contact_email, contact_phone } = data;

  const [result] = await db.query(
    "UPDATE offices SET name = ?, address = ?, contact_email = ?, contact_phone = ? WHERE id = ?",
    [name, address, contact_email, contact_phone, id]
  );

  return result.affectedRows > 0;
};