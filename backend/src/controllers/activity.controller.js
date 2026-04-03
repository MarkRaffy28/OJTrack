import { ensureUserExists } from "../helpers/user.helper.js";
import { fetchOrFail } from "../helpers/resource.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { fetchStudentActivities, logActivity } from "../models/activity.model.js";
import { fetchStudentOjts } from "../models/ojt.model.js";
import { findUserByDatabaseId } from "../models/user.model.js";
import { logActivitySchema, fetchStudentActivitiesSchema } from "../validators/activity.validator.js";


export const fetchStudentActivitiesController = async (req, res) => {
  const data = validate(res, fetchStudentActivitiesSchema, req.query);
  if (!data) return;

  const { databaseId, ojtId } = data;

  if (!await ensureUserExists(res, findUserByDatabaseId, databaseId)) return;
  if (!await fetchOrFail(res, fetchStudentOjts, [databaseId], "Student's OJTs not found")) return;

  const activities = await fetchOrFail(res, fetchStudentActivities, [databaseId], "Activities not found");
  if (!activities) return;

  const filteredActivities = activities.filter(activity => 
    activity.ojtId === Number(ojtId) || 
    (activity.targetType === "USER" && (activity.ojtId === null || activity.ojtId === 0))
  );

  return res.status(200).json(filteredActivities);
};

export const logActivityController = async (data) => {
  const parsed = logActivitySchema.safeParse(data);
  if (!parsed.success) {
    console.error("Failed to log activity due to validation error:", parsed.error);
    return;
  };

  const { databaseId, ojtId = null, action, targetType = null, targetId = null, description = null } = parsed.data;

  return await logActivity(databaseId, ojtId, action, targetType, targetId, description);
};