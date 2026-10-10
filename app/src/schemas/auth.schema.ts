import { z } from "zod";
import { OTPSchema, PasswordSchema } from "./common.schema";
import {
  AdminUserSchema,
  BaseUserSchema,
  EmergencyContactSchema,
  GenderSchema,
  InstructorUserSchema,
  StudentUserSchema,
  SupervisorUserSchema,
} from "./user.schema";
import { OfficeSchema } from "./office.schema";

export const LoginRequestSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Identifier is required")
    .max(100, "Identifier must be at most 100 characters long"),
  password: z.string().min(1, "Password is required"),
});

const LoginBaseUserSchema = BaseUserSchema.extend({
  username: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: GenderSchema.nullable(),
  homeAddress: z.string().nullable(),
  presentAddress: z.string().nullable(),
  contactNumber: z.string().nullable(),
  email: z.string().nullable(),
});

const LoginStudentUserSchema = LoginBaseUserSchema.extend({
  role: z.literal("student"),
  studentDetail: StudentUserSchema.shape.studentDetail,
  emergencyContacts: StudentUserSchema.shape.emergencyContacts,
});

const LoginInstructorUserSchema = LoginBaseUserSchema.extend({
  role: z.literal("instructor"),
  instructorDetail: InstructorUserSchema.shape.instructorDetail,
});

const LoginSupervisorUserSchema = LoginBaseUserSchema.extend({
  role: z.literal("supervisor"),
  supervisorDetail: SupervisorUserSchema.shape.supervisorDetail
    .extend({ office: OfficeSchema.nullable() })
    .nullable(),
});

const LoginAdminUserSchema = LoginBaseUserSchema.extend({
  role: z.literal("admin"),
});

const LoginUserSchema = z.discriminatedUnion("role", [
  LoginStudentUserSchema,
  LoginInstructorUserSchema,
  LoginSupervisorUserSchema,
  LoginAdminUserSchema,
]);

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal("Bearer"),
  user: LoginUserSchema,
});

export const PasswordRegistrationSchema = z.object({
  newPassword: PasswordSchema,

  confirmPassword: z.string(),
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
  emergencyContact: EmergencyContactSchema.omit({
    id: true,
    isPrimary: true,
  }),
});

export const VerifyEmailRequestSchema = z.object({
  otp: OTPSchema,
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),

  newPassword: PasswordSchema,

  confirmPassword: z.string().min(1, "Confirm new password is required"),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z
    .email("Invalid email address")
    .min(1, "Email is required")
    .max(100, "Email must be at most 100 characters long"),
});

export const VerifyForgotPasswordOTPRequestSchema = z.object({
  email: z.email(),
  otp: OTPSchema,
});

export const ResetPasswordRequestSchema = z.object({
  email: z.email(),
  newPassword: PasswordSchema,

  confirmPassword: z.string().min(1, "Confirm new password is required"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export type PasswordRegistration = z.infer<typeof PasswordRegistrationSchema>;
export type CommonRegistrationRequest = z.infer<typeof CommonRegistrationRequestSchema>;
export type StudentRegistrationRequest = z.infer<typeof StudentRegistrationRequestSchema>;

export type AuthSession = z.infer<typeof LoginResponseSchema>;

export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type VerifyForgotPasswordOTPRequest = z.infer<
  typeof VerifyForgotPasswordOTPRequestSchema
>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
