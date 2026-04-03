import { db } from "../config/db.js";

export const getOfficesList = async () => {
  const [rows] = await db.query(
    "SELECT * FROM offices"
  );

  return rows || null;
};