import { ensureUserExists } from "../helpers/user.helper.js";
import { fetchOrFail } from "../helpers/resource.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { getStudentActivities, logActivity } from "../models/activity.model.js";
import { findUserByDatabaseId } from "../models/user.model.js";
import { logActivitySchema, getActivitiesSchema } from "../validators/activity.validator.js";


export const getActivitiesController = async (req, res) => {
  const data = validate(res, getActivitiesSchema, req.query);
  if (!data) return;

  const { databaseId, ojtId } = data;

  if (!await ensureUserExists(res, findUserByDatabaseId, databaseId)) return;

  const activities = await fetchOrFail(res, getStudentActivities, [databaseId], "Activities not found");
  if (!activities) return;

  const filteredActivities = ojtId 
    ? activities.filter(activity => 
        activity.ojtId === Number(ojtId) || 
        (activity.targetType === "USER" && (activity.ojtId === null || activity.ojtId === 0))
      )
    : activities;

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