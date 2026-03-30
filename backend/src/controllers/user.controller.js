import bcrypt from "bcrypt";
import { treeifyError } from "zod";
import { 
  findUserByDatabaseId, findUserByEmail, findUserByUserId, findUserByUsername, fetchStudentInformation as _fetchStudentInformation, 
  fetchStudentOjts as _fetchStudentOjts, updateStudentUserProfile as _updateStudentUserProfile,
  updateUserPassword as _updateUserPassword,
} from "../models/user.model.js";
import { studentUpdateProfileSchema } from "../validators/user.validator.js";

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ message: "Invalid request data" });
    }

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

export const checkUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

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

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: "Invalid request data" });
    }

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

export const fetchStudentInformation = async (req, res) => {
  try {
    const { databaseId } = req.params;
    if (!databaseId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const user = await _fetchStudentInformation(databaseId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);

  } catch(error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const fetchStudentOjts = async (req, res) => {
  try {
    const { databaseId } = req.params;
    if (!databaseId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const user = await findUserByDatabaseId(databaseId);
    if (!user) {
      return res.status(404).json({  message: "User not found" });
    }

    const studentOjts = await _fetchStudentOjts(databaseId);
    if (!studentOjts) {
      return res.status(404).json({
        message: "Student OJTs not found"
      })
    }

    return res.status(200).json(studentOjts);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const updateStudentUserProfile = async (req, res) => {
  try {
    const parsed = studentUpdateProfileSchema.safeParse(req.body);

    const { databaseId } = req.params;
    if (!databaseId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { username, userId, email } = parsed.data;

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

    await _updateStudentUserProfile(parsed.data, databaseId);

    res.status(200).json({ message: "User profile updated successfully" });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const updateUserPassword = async (req, res) => {
  try {
    const { databaseId } = req.params;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || !databaseId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const user = await findUserByDatabaseId(databaseId);
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await _updateUserPassword(hashedNewPassword, databaseId);

    res.status(200).json({ message: "Password has been updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}