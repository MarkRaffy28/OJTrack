import bcrypt from "bcrypt";
import { treeifyError } from "zod";
import { logActivityController } from "./activity.controller.js";
import { 
  findUserByDatabaseId, findUserByEmail, findUserByUserId, findUserByUsername, fetchStudentProfile, fetchSupervisorProfile, updateStudentUserProfile,
  updateUserPassword
} from "../models/user.model.js";
import { 
  checkEmailSchema, checkUserIdSchema, checkUsernameSchema, fetchStudentProfileSchema, fetchSupervisorProfileSchema, studentUpdateProfileSchema,
  updateUserPasswordSchema 
} from "../validators/user.validator.js";


export const checkEmailController = async (req, res) => {
  try {
    const parsed = checkEmailSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }
    const { email } = parsed.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(200).json({
        available: false,
        message: "Email is already taken"
      });
    }

    return res.status(200).json({
      available: true,
      message: "Email is available"
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const checkUserIdController = async (req, res) => {
  try {
    const parsed = checkUserIdSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }
    const { userId } = parsed.data;

    const existingUser = await findUserByUserId(userId);
    if (existingUser) {
      return res.status(200).json({
        available: false,
        message: "User ID is already taken"
      });
    }

    return res.status(200).json({
      available: true,
      message: "User ID is available"
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const checkUsernameController = async (req, res) => {
  try {
    const parsed = checkUsernameSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }
    const { username } = parsed.data;

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(200).json({
        available: false,
        message: "Username is already taken"
      });
    }

    return res.status(200).json({
      available: true,
      message: "Username is available"
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const fetchStudentProfileController = async (req, res) => {
  try {
    const parsed = fetchStudentProfileSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }
    const { databaseId } = parsed.data;

    const user = await fetchStudentProfile(databaseId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);

  } catch(error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const fetchSupervisorProfileController = async (req, res) => {
  try {
    const parsed = fetchSupervisorProfileSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }
    const { databaseId } = parsed.data;

    const user = await fetchSupervisorProfile(databaseId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);

  } catch(error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const updateStudentUserProfileController = async (req, res) => {
  try {
    const parsed = studentUpdateProfileSchema.safeParse({ ...req.params, ...req.body });

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { databaseId, username, userId, email } = parsed.data;

    const user = await findUserByDatabaseId(databaseId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.username !== username) {
      const existingUsername = await findUserByUsername(username);
      if (existingUsername && existingUsername.id !== user.id) {
        return res.status(409).json({ message: "Username already exists" });
      }
    }

    if (user.email_address !== email) {
      const existingEmail = await findUserByEmail(email);
      if (existingEmail && existingEmail !== user.id) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    if (user.userId !== userId) {
      const existingUserId = await findUserByUserId(userId);
      if (existingUserId && existingUserId !== user.id) {
        return res.status(409).json({ message: "User ID already exists" });
      }
    }

    await updateStudentUserProfile(parsed.data, databaseId);

    await logActivityController({
      databaseId: Number(databaseId),
      action: "UPDATE_PROFILE",
      targetType: "USER",
      targetId: Number(databaseId),
      description: "User profile updated successfully"
    });

    res.status(200).json({ message: "User profile updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const updateUserPasswordController = async (req, res) => {
  try {
    const parsed = updateUserPasswordSchema.safeParse({ ...req.params, ...req.body });

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { databaseId, currentPassword, newPassword } = parsed.data;

    const user = await findUserByDatabaseId(databaseId);
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

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

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}