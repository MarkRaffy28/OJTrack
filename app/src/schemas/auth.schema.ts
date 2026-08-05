import { z } from "zod";
import { UserSchema } from "./user.schema";

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
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export type AuthSession = z.infer<typeof LoginResponseSchema>;

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
