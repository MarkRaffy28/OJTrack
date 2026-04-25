import { db } from "../config/db.js";

export const getActivities = async (databaseId) => {
  const [rows] = await db.query(
    `
      SELECT 
        id, 
        ojt_id AS ojtId,
        action, 
        target_type AS targetType,
        target_id AS targetId,
        description,
        created_at AS createdAt
      FROM activity 
      WHERE database_id = ?
      ORDER BY created_at DESC
    `,
    [databaseId]
  );

  return rows || null;
};

export const logActivity = async (databaseId, ojtId, action, targetType, targetId, description) => {
  const [result] = await db.query(
    `INSERT INTO activity (database_id, ojt_id, action, target_type, target_id, description) VALUES (?, ?, ?, ?, ?, ?)`,
    [databaseId, ojtId, action, targetType, targetId, description]
  );

  return result.insertId;
};