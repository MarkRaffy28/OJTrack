import { z } from "zod";
import { PasswordSchema } from "./common.schema";
import { BaseUserSchema, EmergencyContactSchema, UserSchema } from "./user.schema";

export const LoginRequestSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Identifier is required")
    .max(100, "Identifier must be at most 100 characters long"),
  password: z.string().min(1, "Password is required"),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal("Bearer"),
  user: UserSchema,
});

export const PasswordRegistrationSchema = z.object({
  newPassword: PasswordSchema,

  confirmPassword: z.string(),
});

// prettier-ignore
export const EmergencyContactRequestSchema = EmergencyContactSchema.omit({
  id: true,
  isPrimary: true,
});

// prettier-ignore
export const CommonRegistrationRequestSchema = BaseUserSchema
  .omit({
    id: true,
    profilePicture: true,
    fullName: true,
    emailVerifiedAt: true,
    status: true,
    activatedAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend(PasswordRegistrationSchema.shape);

export const StudentRegistrationRequestSchema = CommonRegistrationRequestSchema.extend({
  emergencyContact: EmergencyContactRequestSchema,
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  newPasswordConfirmation: z.string().min(8),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.email(),
});

export const ResetPasswordRequestSchema = z.object({
  token: z.string(),
  email: z.email(),
  password: z.string().min(8),
  passwordConfirmation: z.string().min(8),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export type PasswordRegistration = z.infer<typeof PasswordRegistrationSchema>;
export type CommonRegistrationRequest = z.infer<typeof CommonRegistrationRequestSchema>;
export type StudentRegistrationRequest = z.infer<typeof StudentRegistrationRequestSchema>;

export type AuthSession = z.infer<typeof LoginResponseSchema>;

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
