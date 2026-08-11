import {
  CommonRegistrationRequest,
  CommonRegistrationRequestSchema,
  LoginRequest,
  LoginRequestSchema,
  LoginResponseSchema,
  RegistrationResponseSchema,
  StudentRegistrationRequest,
  StudentRegistrationRequestSchema,
} from "@/schemas/auth.schema";
import { post } from "./request.api";

export const login = async (data: LoginRequest) =>
  post("/auth/login", data, LoginRequestSchema, LoginResponseSchema);

export const registerStudent = async (data: StudentRegistrationRequest) =>
  post(
    "/auth/register/student",
    data,
    StudentRegistrationRequestSchema,
    RegistrationResponseSchema,
  );

export const registerSupervisor = async (data: CommonRegistrationRequest) =>
  post(
    "/auth/register/supervisor",
    data,
    CommonRegistrationRequestSchema,
    RegistrationResponseSchema,
  );
