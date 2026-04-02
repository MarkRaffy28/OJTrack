import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { treeifyError } from "zod";
import { logActivityController } from "./activity.controller.js";
import { 
  createStudentUser, createSupervisorUser, markEmailVerified, resetUserPassword, saveForgotPasswordOTP, saveVerificationOTP
} from "../models/auth.model.js";
import { findUserByDatabaseId, findUserByEmail, findUserByUserId, findUserByUsername } from "../models/user.model.js";
import { checkOTPCooldown, generateOTP, getOTPExpiry } from "../utils/otp.js";
import { sendOTPEmail } from "../utils/mail.js";
import { 
  loginSchema, logoutSchema, resetPasswordSchema, sendEmailVerificationOTPSchema, sendForgotPasswordOTPSchema, studentRegistrationSchema, 
  supervisorRegistrationSchema, verifyEmailOTPSchema 
} from "../validators/auth.validator.js";


export const loginController = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { username, password } = parsed.data;

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await logActivityController({
      databaseId: user.id,
      action: "LOGIN",
      targetType: "USER",
      targetId: user.id,
      description: "User logged in"
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const logoutController = async (req, res) => {
  try {
    const parsed = logoutSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { databaseId } = parsed.data;

    const user = await findUserByDatabaseId(databaseId);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await logActivityController({
      databaseId,
      action: "LOGOUT",
      targetType: "USER",
      targetId: databaseId,
      description: "User logged out"
    });

    res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const registerStudentController = async (req, res) => {
  try {
    const parsed = studentRegistrationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { username, password, userId, email } = parsed.data;

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const existingUserId = await findUserByUserId(userId);
    if (existingUserId) {
      return res.status(409).json({ message: "User ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUserId = await createStudentUser({
      ...parsed.data,
      password: hashedPassword
    });

    await logActivityController({
      databaseId: newUserId,
      action: "REGISTER",
      targetType: "USER",
      targetId: newUserId,
      description: "Student registered successfully"
    });

    res.status(201).json({
      message: "User registered successfully",
      newUserId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const registerSupervisorController = async (req, res) => {
  const parsed = supervisorRegistrationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json( treeifyError(parsed.error) );
  }
  const { username, password, userId, email } = parsed.data;

  try {
    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const existingUserId = await findUserByUserId(userId);
    if (existingUserId) {
      return res.status(409).json({ message: "User ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUserId = await createSupervisorUser({
      ...parsed.data,
      password: hashedPassword
    });

    await logActivityController({
      databaseId: newUserId,
      action: "REGISTER",
      targetType: "USER",
      targetId: newUserId,
      description: "Supervisor registered successfully"
    });

    res.status(201).json({
      message: "User registered successfully",
      newUserId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const resetPasswordController = async (req, res) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { email, otp, newPassword } = parsed.data;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    };

    if (!user.password_reset_token) {
      return res.status(400).json({ message: "No OTP found. Request a new one." });
    }

    if (new Date() > new Date(user.password_reset_expires)) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, user.password_reset_token);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" })
    };

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await resetUserPassword(email, hashedPassword);

    await logActivityController({
      databaseId: user.id,
      action: "UPDATE_PASSWORD",
      targetType: "USER",
      targetId: user.id,
      description: "User reset password via OTP"
    });

    res.status(200).json({ message: "Password has been reset successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendEmailVerificationOTPController = async (req, res) => {
  try {
    const parsed = sendEmailVerificationOTPSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { email } = parsed.data;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.email_verified_at) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const timeLeft = checkOTPCooldown(user.email_verification_expires);

    if (timeLeft !== null) {
      return res.status(400).json({
        message: "Please wait before resending OTP",
        timeLeftSeconds: timeLeft,
      });
    }

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 12);
    const expires = getOTPExpiry();

    await saveVerificationOTP(email, hashedOTP, expires);

    await sendOTPEmail({
      email,
      otp,
      type: "verify",
      name: user.first_name,
    });

    res.status(200).json({ message: "Verification OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendForgotPasswordOTPController = async (req, res) => {
  try {
    const parsed = sendForgotPasswordOTPSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { email } = parsed.data;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.email_verified_at) {
      return res.status(400).json({ message: "Email must be verified first" });
    }

    const timeLeft = checkOTPCooldown(user.password_reset_expires);

    if (timeLeft !== null) {
      return res.status(400).json({
        message: "Please wait before resending OTP",
        timeLeftSeconds: timeLeft,
      });
    }

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 12);
    const expires = getOTPExpiry();

    await saveForgotPasswordOTP(email, hashedOTP, expires);

    await sendOTPEmail({
      email,
      otp,
      type: "forgot",
      name: user.first_name,
    });

    res.status(200).json({ message: "Password reset OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmailOTPController = async (req, res) => {
  try {
    const parsed = verifyEmailOTPSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { email, otp } = parsed.data;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.email_verified_at) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.email_verification_token || !user.email_verification_expires) {
      return res.status(400).json({ message: "No OTP found. Request a new one." });
    }

    if (new Date() > new Date(user.email_verification_expires)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, user.email_verification_token);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await markEmailVerified(email);

    res.status(200).json({ message: "Email verified successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};