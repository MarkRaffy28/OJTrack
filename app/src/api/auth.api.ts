import {
  ChangePasswordRequest,
  ChangePasswordRequestSchema,
  CommonRegistrationRequest,
  CommonRegistrationRequestSchema,
  LoginRequest,
  LoginRequestSchema,
  LoginResponseSchema,
  StudentRegistrationRequest,
  StudentRegistrationRequestSchema,
  VerifyEmailRequest,
  VerifyEmailRequestSchema,
} from "@/schemas/auth.schema";
import { UserResponseSchema } from "@/schemas/user.schema";
import { get, patch, post } from "./request.api";

export const login = async (data: LoginRequest) =>
  post("/auth/login", data, LoginRequestSchema, LoginResponseSchema);

export const me = async () => get("auth/me", UserResponseSchema);

export const registerStudent = async (data: StudentRegistrationRequest) =>
  post(
    "/auth/register/student",
    data,
    StudentRegistrationRequestSchema,
    UserResponseSchema,
  );

export const registerSupervisor = async (data: CommonRegistrationRequest) =>
  post(
    "/auth/register/supervisor",
    data,
    CommonRegistrationRequestSchema,
    UserResponseSchema,
  );

export const changePassword = async (data: ChangePasswordRequest) =>
  patch("/auth/password", data, ChangePasswordRequestSchema);

export const sendVerificationCode = async () => post("/auth/email/verification-code");

export const verifyEmail = async (data: VerifyEmailRequest) =>
  post("/auth/email/verify", data, VerifyEmailRequestSchema, UserResponseSchema);
