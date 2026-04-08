import { db } from "../config/db.js";

export const getSupervisorStats = async (supervisorId) => {
  const [statusCounts] = await db.query(
    `
      SELECT 
        status, 
        COUNT(*) as count
      FROM student_ojt
      WHERE supervisor_id = ?
      GROUP BY status
    `,
    [supervisorId]
  );

  const [[counts]] = await db.query(
    `
      SELECT 
        (
          SELECT COUNT(*) 
          FROM reports r 
          JOIN student_ojt so ON r.ojt_id = so.id 
          WHERE so.supervisor_id = ? AND r.status = 'pending'
        ) as pendingReports,
        (
          SELECT COUNT(DISTINCT so.student_id) 
          FROM attendance a 
          JOIN student_ojt so ON a.ojt_id = so.id 
          WHERE so.supervisor_id = ? AND a.date = CURDATE()
          AND (
            (a.morning_in IS NOT NULL AND a.morning_out IS NULL) 
            OR (a.afternoon_in IS NOT NULL AND a.afternoon_out IS NULL)
          )
        ) as activeToday
    `,
    [supervisorId, supervisorId]
  );

  return {
    statusCounts,
    pendingReports: counts.pendingReports,
    activeToday: counts.activeToday
  };
};
