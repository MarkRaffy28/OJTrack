import {
  CommonRegistrationRequest,
  CommonRegistrationRequestSchema,
  LoginRequest,
  LoginRequestSchema,
  LoginResponseSchema,
  StudentRegistrationRequest,
  StudentRegistrationRequestSchema,
} from "@/schemas/auth.schema";
import { UserResponseSchema } from "@/schemas/user.schema";
import { post } from "./request.api";

export const login = async (data: LoginRequest) =>
  post("/auth/login", data, LoginRequestSchema, LoginResponseSchema);

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
