import bcrypt from "bcrypt";
import { fetchOrFail } from "../helpers/resource.helper.js";
import { ensureUniqueField, ensureUserExists } from "../helpers/user.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { logActivityController } from "./activity.controller.js";
import { 
  findUserByDatabaseId, findUserByEmail, findUserByUserId, findUserByUsername, fetchStudentProfile, fetchSupervisorProfile, updateStudentUserProfile,
  updateUserPassword
} from "../models/user.model.js";
import { 
  checkEmailSchema, checkExistenceSchema, checkUserIdSchema, checkUsernameSchema, fetchProfileSchema, updateProfileSchema, updateStudentProfileSchema,
  updateUserPasswordSchema 
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

export const fetchProfileController = async (req, res) => {
  const data = validate(res, fetchProfileSchema, req.params);
  if (!data) return;

  const { role, databaseId } = data;

  if (role === "student") {
    const user = await fetchOrFail(res, fetchStudentProfile, [databaseId], "User not found");
    if (!user) return;

    return res.status(200).json(user);
  } else if (role === "supervisor") {
    const user = await fetchOrFail(res, fetchSupervisorProfile, [databaseId], "User not found");
    if (!user) return;

    return res.status(200).json(user);
  }

  return res.status(400).json({ message: "Provide role and databaseId" });
};

export const updateUserProfileController = async (req, res) => {
  const baseData = validate(res, updateProfileSchema, req.params);
  if (!baseData) return;

  const { role, databaseId } = baseData;

  let data;
  if (role === "student") {
    data = validate(res, updateStudentProfileSchema, req.body);
    if (!data) return;
  } else if (role === "supervisor") {
    // TODO
  } else {
    return res.status(400).json({ message: "Invalid role" });
  }

  const { username, email, userId } = data;

  const user = await fetchOrFail(res, findUserByDatabaseId, [databaseId], "User not found");
  if (!user) return;

  if (!(await ensureUniqueField(res, findUserByUsername, username, user.username, user.id, "Username"))) return;
  if (!(await ensureUniqueField(res, findUserByEmail, email, user.email_address, user.id, "Email"))) return;
  if (!(await ensureUniqueField(res, findUserByUserId, userId, user.userId, user.id, "User ID"))) return;

  await updateStudentUserProfile(data, databaseId);

  await logActivityController({
    databaseId: Number(databaseId),
    action: "UPDATE_PROFILE",
    targetType: "USER",
    targetId: Number(databaseId),
    description: `${role.charAt(0).toUpperCase() + role.slice(1)} profile updated successfully`
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