import { z } from "zod";
import { GenderSchema, UserSchema } from "./user.schema";

export const LoginRequestSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Identifier is required")
    .max(100, "Identifier must be at most 100 characters long"),
  password: z.string().min(1, "Password is required"),
});

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  user: UserSchema,
});

export const CommonRegistrationRequestSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password must be at most 255 characters long"),

  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password must be at most 255 characters long"),

  username: z
    .string()
    .min(1, "Username is required")
    .max(100, "Username must be at most 100 characters long"),

  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be at most 100 characters long"),

  middleName: z
    .string()
    .max(50, "Middle name must be at most 50 characters long")
    .optional()
    .nullable(),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters long"),

  extensionName: z
    .string()
    .max(10, "Extension name must be at most 10 characters long")
    .optional()
    .nullable(),

  birthDate: z
    .string()
    .min(1, "Birthdate is required")
    .pipe(z.iso.date("Invalid birth date")),

  gender: GenderSchema.optional(),

  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must be at most 255 characters long"),

  contactNumber: z
    .string()
    .min(10, "Contact number is required")
    .max(15, "Contact number must be at most 15 characters long"),

  email: z
    .email("Invalid email address")
    .min(1, "Email is required")
    .max(100, "Email must be at most 100 characters long"),
});

export const StudentRegistrationRequestSchema = CommonRegistrationRequestSchema.extend({
  year: z.coerce.number().int().min(1).max(10),

  program: z
    .string()
    .min(1, "Program is required")
    .max(100, "Program must be at most 100 characters long"),

  major: z
    .string()
    .min(1, "Major is required")
    .max(100, "Major must be at most 100 characters long"),

  section: z
    .string()
    .min(1, "Section is required")
    .max(10, "Section must be at most 10 characters long"),
});

export const RegistrationResponseSchema = z.object({
  user: UserSchema,
});

export const ChangePasswordRequestSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
  new_password_confirmation: z.string().min(8),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.email(),
});

export const ResetPasswordRequestSchema = z.object({
  token: z.string(),
  email: z.email(),
  password: z.string().min(8),
  password_confirmation: z.string().min(8),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export type CommonRegistrationRequest = z.infer<typeof CommonRegistrationRequestSchema>;
export type StudentRegistrationRequest = z.infer<typeof StudentRegistrationRequestSchema>;

export type AuthSession = z.infer<typeof LoginResponseSchema>;

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
