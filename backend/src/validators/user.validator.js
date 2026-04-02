import { z } from "zod";

export const checkEmailSchema = z.object({
  email: z.email("Invalid email address"),
});

export const checkUserIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const checkUsernameSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"),
});

export const fetchStudentProfileSchema = z.object({
  databaseId: z.coerce.number().int().positive(),
});

export const fetchSupervisorProfileSchema = z.object({
  databaseId: z.coerce.number().int().positive(),
});

export const studentUpdateProfileSchema = z.object({
  databaseId: z.coerce.number().int().positive(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"),
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

export const updateUserPasswordSchema = z.object({
  databaseId: z.coerce.number().int().positive(),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(1, "New password is required"),
});