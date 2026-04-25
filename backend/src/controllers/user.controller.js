import bcrypt from "bcrypt";
import { fetchOrFail } from "../helpers/resource.helper.js";
import { ensureUniqueField, ensureUserExists } from "../helpers/user.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { logActivityController } from "./activity.controller.js";
import { 
  deleteUserRecord, findUserByDatabaseId, findUserByEmail, findUserByUserId, findUserByUsername, getAdminDashboardStats, getAdminProfile, 
  getAdminRecentActivities, getAllAdmins, getAllSupervisors, getStudentProfile, getSupervisorProfile, getSupervisorStats, updateStudentUserProfile, 
  updateSupervisorUserProfile, updateUserPassword, updateAdminUserProfile
} from "../models/user.model.js";
import { 
  deleteUserRecordSchema, checkEmailSchema, checkExistenceSchema, checkUserIdSchema, checkUsernameSchema, getAdminDashboardSchema, getProfileSchema, supervisorStatsSchema, updateProfileSchema,
  updateStudentProfileSchema, updateSupervisorProfileSchema, updateUserPasswordSchema, updateAdminProfileSchema
} from "../validators/user.validator.js";


export const checkExistenceController = async (req, res) => {
  const data = validate(res, checkExistenceSchema, req.params);
  if (!data) return;

  const { field, value } = data;

  if (field === "email") {
    const data = validate(res, checkEmailSchema, { email: value });
    if (!data) return;

    const existingUser = await findUserByEmail(value);

    return res.status(200).json({ 
      available: !existingUser, 
      message: existingUser ? "Email is already taken" : "Email is available" 
    });
  };

  if (field === "userId") {
    const data = validate(res, checkUserIdSchema, { userId: value });
    if (!data) return;

    const existingUser = await findUserByUserId(value);

    return res.status(200).json({
      available: !existingUser, 
      message: existingUser ? "User ID is already taken" : "User ID is available" 
    });
  };

  if (field === "username") {
    const data = validate(res, checkUsernameSchema, { username: value });
    if (!data) return;

    const existingUser = await findUserByUsername(value);

    return res.status(200).json({ 
      available: !existingUser, 
      message: existingUser ? "Username is already taken" : "Username is available" 
    });
  };

  return res.status(400).json({ message: "Provide email, userId or username" });
};

export const deleteTraineeController = async (req, res) => {
  const data = validate(res, deleteUserRecordSchema, req.params);
  if (!data) return;

  const { databaseId } = data;

  const success = await deleteUserRecord(databaseId);
  if (!success) return res.status(404).json({ message: "User not found" });

  await logActivityController({
    databaseId: req.user?.id || Number(databaseId),
    action: "DELETE_TRAINEE",
    targetType: "USER",
    targetId: Number(databaseId),
    description: "Trainee deleted successfully"
  });

  res.status(200).json({ message: "Trainee deleted successfully" });
};

export const getAdminDashboardController = async (req, res) => {
  const data = validate(res, getAdminDashboardSchema, { ...req.params, ...req.query });
  if (!data) return;

  const { databaseId, cohort } = data;

  if (req.user?.role !== "admin" || Number(req.user?.id) !== Number(databaseId)) {
    return res.status(403).json({ message: "Unauthorized access to admin dashboard" });
  }

  const [stats, recentActivities] = await Promise.all([
    getAdminDashboardStats(cohort),
    getAdminRecentActivities(5),
  ]);

  return res.status(200).json({
    stats: {
      totalTrainees: Number(stats?.totalTrainees || 0),
      pendingReports: Number(stats?.pendingReports || 0),
      presentToday: Number(stats?.presentToday || 0),
    },
    recentActivities,
  });
};

export const getAllAdminsController = async (req, res) => {
  const admins = await getAllAdmins();
  res.status(200).json(admins);
};

export const getProfileController = async (req, res) => {
  const data = validate(res, getProfileSchema, req.params);
  if (!data) return;

  const { role, databaseId } = data;

  if (role === "student") {
    const user = await fetchOrFail(res, getStudentProfile, [databaseId], "User not found");
    if (!user) return;
    return res.status(200).json(user);

  } else if (role === "supervisor") {
    const user = await fetchOrFail(res, getSupervisorProfile, [databaseId], "User not found");
    if (!user) return;
    return res.status(200).json(user);
    
  } else if (role === "admin") {
    const user = await fetchOrFail(res, getAdminProfile, [databaseId], "User not found");
    if (!user) return;
    return res.status(200).json(user);
  }

  return res.status(400).json({ message: "Provide role and databaseId" });
};

export const getAllSupervisorsController = async (req, res) => {
  const supervisors = await getAllSupervisors();
  res.status(200).json(supervisors);
};

export const getSupervisorStatsController = async (req, res) => {
  const data = validate(res, supervisorStatsSchema, req.params);
  if (!data) return;

  const { supervisorId } = data;

  const stats = await fetchOrFail(res, getSupervisorStats, [supervisorId], "No stats found");
  if (!stats) return;

  res.status(200).json(stats);
};

export const updateUserProfileController = async (req, res) => {
  const baseData = validate(res, updateProfileSchema, req.params);
  if (!baseData) return;

  const { role, databaseId } = baseData;

  let data;
  let identifierUserId;
  if (role === "student") {
    data = validate(res, updateStudentProfileSchema, req.body);
    if (!data) return;
    identifierUserId = data.studentId;
  } else if (role === "supervisor") {
    data = validate(res, updateSupervisorProfileSchema, req.body);
    if (!data) return;
    identifierUserId = data.employeeId;
  } else if (role === "admin") {
    data = validate(res, updateAdminProfileSchema, req.body);
    if (!data) return;
    identifierUserId = data.adminId;
  } else {
    return res.status(400).json({ message: "Invalid role" });
  }

  const { username, email } = data;

  const user = await fetchOrFail(res, findUserByDatabaseId, [databaseId], "User not found");
  if (!user) return;

  if (!(await ensureUniqueField(res, findUserByUsername, username, user.username, user.id, "Username"))) return;
  if (!(await ensureUniqueField(res, findUserByEmail, email, user.email_address, user.id, "Email"))) return;
  if (!(await ensureUniqueField(res, findUserByUserId, identifierUserId, user.user_id, user.id, "User ID"))) return;

  const emailChanged = email !== user.email_address;
  if (role === "student") {
    await updateStudentUserProfile(data, databaseId, emailChanged);
  } else if (role === "supervisor") {
    await updateSupervisorUserProfile(data, databaseId, emailChanged);
  } else if (role === "admin") {
    await updateAdminUserProfile(data, databaseId, emailChanged);
  } else {
    return res.status(400).json({ message: "Invalid role" });
  }

  const actorId = req.user?.id || Number(databaseId);
  const isSelf = Number(actorId) === Number(databaseId);

  await logActivityController({
    databaseId: actorId,
    action: isSelf ? "UPDATE_PROFILE" : "EDIT_USER",
    targetType: "USER",
    targetId: Number(databaseId),
    description: isSelf 
      ? `${role.charAt(0).toUpperCase() + role.slice(1)} profile updated successfully` 
      : `Updated profile details for user`
  });

  res.status(200).json({ message: "User profile updated successfully" });
};

export const updateUserPasswordController = async (req, res) => {
  const data = validate(res, updateUserPasswordSchema, { ...req.params, ...req.body });
  if (!data) return;

  const { databaseId, currentPassword, newPassword } = data;

  const user = await ensureUserExists(res, findUserByDatabaseId, databaseId);
  if (!user) return;

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Current password is incorrect." });
  };

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  await updateUserPassword(hashedNewPassword, databaseId);

  await logActivityController({
    databaseId: Number(databaseId),
    action: "UPDATE_PASSWORD",
    targetType: "USER",
    targetId: Number(databaseId),
    description: "User password updated successfully"
  });

  res.status(200).json({ message: "Password has been updated successfully" });
};