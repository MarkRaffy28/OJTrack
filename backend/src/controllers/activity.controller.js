import { treeifyError } from "zod";
import { fetchStudentActivities, logActivity } from "../models/activity.model.js";
import { fetchStudentOjts } from "../models/ojt.model.js";
import { findUserByDatabaseId } from "../models/user.model.js";
import { logActivitySchema, fetchStudentActivitiesSchema } from "../validators/activity.validator.js";


export const fetchStudentActivitiesController = async (req, res) => {
  try {
    const parsed = fetchStudentActivitiesSchema.safeParse(req.query);
    
    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { databaseId, ojtId } = parsed.data;

    const user = await findUserByDatabaseId(databaseId);
    if (!user) {
      return res.status(404).json({  message: "User not found" });
    }

    const studentOjts = await fetchStudentOjts(databaseId);
    if (!studentOjts) {
      return res.status(404).json({ message: "Student's OJTs not found" })
    }

    const activities = await fetchStudentActivities(databaseId);
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

export const logActivityController = async (data) => {
  try {
    const parsed = logActivitySchema.safeParse(data);

    if (!parsed.success) {
      console.warn("Activity log validation failed:", treeifyError(parsed.error));
      return null;
    }
    const { databaseId, ojtId, action, targetType, targetId, description } = parsed.data;

    return await logActivity(databaseId, ojtId, action, targetType, targetId, description);

  } catch (err) {
    console.error("Error in logActivityController helper:", err);
    return null;
  }
};