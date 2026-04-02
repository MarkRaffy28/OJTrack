import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"),
  password: z.string().min(1, "Password is required"),
})

export const logoutSchema = z.object({
  databaseId: z.coerce.number().int().positive(),
});

export const resetPasswordSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string().regex(/^[0-9]+$/, "OTP must contain only digits").min(6, "OTP must be at least 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const sendEmailVerificationOTPSchema = z.object({
  email: z.email("Invalid email address"),
});

export const sendForgotPasswordOTPSchema = z.object({
  email: z.email("Invalid email address"),
});

export const studentRegistrationSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profilePicture: z.string().regex(/^data:image\/(jpeg|jpg|png);base64,[A-Za-z0-9+/=]+$/, "Invalid base64 image format").nullable().optional(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().nullable().optional(),
  lastName: z.string().min(1, "Last name is required"),
  extensionName: z.string().nullable().optional(),
  birthDate: z.coerce.date(),
  gender: z.enum(["Male", "Female", "Other"]),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().regex(/^[0-9]+$/, "Contact number must contain only digits").min(10, "Contact number must be at least 10 digits"),
  email: z.email("Invalid email address"),
  studentId: z.string().min(1, "Student ID is required"),
  year: z.string().min(1, "Year level is required"),
  program: z.string().min(1, "Program is required"),
  major: z.string().min(1, "Major is required"),
});

export const supervisorRegistrationSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profilePicture: z.string().regex(/^data:image\/(jpeg|jpg|png);base64,[A-Za-z0-9+/=]+$/, "Invalid base64 image format").nullable().optional(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().nullable().optional(),
  lastName: z.string().min(1, "Last name is required"),
  extensionName: z.string().nullable().optional(),
  birthDate: z.coerce.date(),
  gender: z.enum(["Male", "Female", "Other"]),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().regex(/^[0-9]+$/, "Contact number must contain only digits").min(10, "Contact number must be at least 10 digits"),
  email: z.email("Invalid email address"),
  employeeId: z.string().min(1, "Employee ID is required"),
  officeId: z.coerce.number().int().positive(),
  position: z.string().min(1, "Position is required"),
});

export const verifyEmailOTPSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string().regex(/^[0-9]+$/, "OTP must contain only digits").min(6, "OTP must be at least 6 digits"),
});