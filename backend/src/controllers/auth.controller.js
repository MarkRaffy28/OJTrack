import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createSaveSendOTP, verifyOTP } from "../helpers/otp.helper.js";
import { ensureUnique, ensureUserExists } from "../helpers/user.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { logActivityController } from "./activity.controller.js";
import { createAdminUser, createStudentUser, createSupervisorUser, markEmailVerified, resetUserPassword } from "../models/auth.model.js";
import { createOjtRecord } from "../models/ojt.model.js";
import { getSettings } from "../models/settings.model.js";
import { findUserByDatabaseId, findUserByEmail, findUserByUserId, findUserByUsername } from "../models/user.model.js";
import { 
  adminRegistrationSchema, loginSchema, logoutSchema, registrationSchema, resetPasswordSchema, sendEmailVerificationOTPSchema, 
  sendForgotPasswordOTPSchema, studentRegistrationSchema, supervisorRegistrationSchema, verifyEmailOTPSchema 
} from "../validators/auth.validator.js";


export const loginController = async (req, res) => {
  const data = validate(res, loginSchema, req.body);
  if (!data) return;

  const { username, password } = data;

  const user = await ensureUserExists(res, findUserByUsername, username, "Invalid credentials");
  if (!user) return;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  };

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
};

export const logoutController = async (req, res) => {
    const data = validate(res, logoutSchema, req.body);
    if (!data) return;

    const { databaseId } = data;

    if (!await ensureUserExists(res, findUserByDatabaseId, databaseId, "Invalid credentials")) return;

    await logActivityController({
      databaseId,
      action: "LOGOUT",
      targetType: "USER",
      targetId: databaseId,
      description: "User logged out"
    });

    res.status(200).json({ message: "Logout successful" });
};

export const registerController = async (req, res) => {
  const baseData = validate(res, registrationSchema, req.params);
  if (!baseData) return;

  const { role } = baseData;

  let data;
  if (role === "student") {
    data = validate(res, studentRegistrationSchema, req.body);
    if (!data) return;
  } else if (role === "supervisor") {
    data = validate(res, supervisorRegistrationSchema, req.body);
    if (!data) return;
  } else if (role === "admin") {
    data = validate(res, adminRegistrationSchema, req.body);
    if (!data) return;
  } else {
    return res.status(400).json({ message: "Invalid role" });
  }

  const { username, email, userId, password } = data;

  if (!await ensureUnique(res, findUserByUsername, username, "Username")) return;
  if (!await ensureUnique(res, findUserByEmail, email, "Email")) return;
  if (!await ensureUnique(res, findUserByUserId, userId, "User ID")) return;

  const hashedPassword = await bcrypt.hash(password, 12);

  const createFn = role === "student" ? createStudentUser : role === "supervisor" ? createSupervisorUser : createAdminUser;
  const newUserId = await createFn({ ...data, password: hashedPassword });

  if (role === "student") {
    const settings = await getSettings();
    const ay = settings['current_academic_year'];
    const term = settings['current_term'];
    const yearKey = `year_${data.year}`;
    const reqHours = settings[`${yearKey}_required_hours`] || 0;
    const sDate = settings[`${yearKey}_start_date`] || null;
    const eDate = settings[`${yearKey}_end_date`] || null;

    if (ay && term) {
      await createOjtRecord({
        studentId: newUserId,
        academicYear: ay,
        term: term,
        requiredHours: reqHours,
        startDate: sDate,
        endDate: eDate,
        status: 'pending'
      });
    }
  }

  let actorId = newUserId;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) actorId = decoded.id;
    } catch (err) {
      // ignore
    }
  }

  await logActivityController({
    databaseId: actorId,
    action: "REGISTER",
    targetType: "USER",
    targetId: newUserId,
    description: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`
  });

  res.status(201).json({
    message: "User registered successfully",
    newUserId,
  });
};

export const resetPasswordController = async (req, res) => {
  const data = validate(res, resetPasswordSchema, req.body);
  if (!data) return;

  const { email, otp, newPassword } = data;

  const user = await ensureUserExists(res, findUserByEmail, email, "User not found");
  if (!user) return;

  if (!await verifyOTP(res, otp, user.password_reset_token, user.password_reset_expires)) return;

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
};

export const sendEmailVerificationOTPController = async (req, res) => {
  const data = validate(res, sendEmailVerificationOTPSchema, req.body);
  if (!data) return;

  const { email } = data;

  const user = await ensureUserExists(res, findUserByEmail, email);
  if (!user) return;

  if (user.email_verified_at) {
    return res.status(400).json({ message: "Email is already verified" });
  };
  
  if (!await createSaveSendOTP(res, email, user, "verify")) return;

  res.status(200).json({ message: "Verification OTP sent to email" });
};

export const sendForgotPasswordOTPController = async (req, res) => {
  const data = validate(res, sendForgotPasswordOTPSchema, req.body);
  if (!data) return;

  const { email } = data;

  const user = await ensureUserExists(res, findUserByEmail, email);
  if (!user) return;

  if (!user.email_verified_at) {
    return res.status(400).json({ message: "Email must be verified first" });
  };

  const otp = await createSaveSendOTP(res, email, user, "forgot");
  if (!otp) return;

  res.status(200).json({ message: "Password reset OTP sent to email" });
};

export const verifyEmailOTPController = async (req, res) => {
  const data = validate(res, verifyEmailOTPSchema, req.body);
  if (!data) return;

  const { email, otp } = data;

  const user = await ensureUserExists(res, findUserByEmail, email);
  if (!user) return;

  if (!await verifyOTP(res, otp, user.email_verification_token, user.email_verification_expires)) return;

  await markEmailVerified(email);

  res.status(200).json({ message: "Email verified successfully" });
};