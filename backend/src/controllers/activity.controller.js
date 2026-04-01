import { treeifyError } from "zod";
import { fetchStudentActivities as _fetchStudentActivities, logActivity as _logActivity } from "../models/activity.model.js";
import { fetchStudentOjts as _fetchStudentOjts, findUserByDatabaseId } from "../models/user.model.js";
import { logActivitySchema, fetchStudentActivitiesSchema } from "../validators/activity.validator.js";

export const fetchStudentActivities = async (req, res) => {
  try {
    const parsed = fetchStudentActivitiesSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { databaseId, ojtId } = parsed.data;

    const user = await findUserByDatabaseId(databaseId);
    if (!user) {
      return res.status(404).json({  message: "User not found" });
    }

    const studentOjts = await _fetchStudentOjts(databaseId);
    if (!studentOjts) {
      return res.status(404).json({ message: "Student's OJTs not found" })
    }

    const activities = await _fetchStudentActivities(databaseId);
    if (!activities) {
      return res.status(404).json({ message: "Activities not found" })
    }

    const filteredActivities = activities.filter(activity => 
      activity.ojtId === Number(ojtId) || 
      (activity.targetType === "USER" && (activity.ojtId === null || activity.ojtId === 0))
    );

    return res.status(200).json(filteredActivities);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const logActivity = async (data) => {
  try {
    const parsed = logActivitySchema.safeParse(data);

    if (!parsed.success) {
      console.warn("Activity log validation failed:", treeifyError(parsed.error));
      return null;
    }
    const { databaseId, ojtId, action, targetType, targetId, description } = parsed.data;

    return await _logActivity(databaseId, ojtId, action, targetType, targetId, description);

  } catch (err) {
    console.error("Error in logActivity helper:", err);
    return null;
  }
};