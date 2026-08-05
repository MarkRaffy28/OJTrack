import { api } from "./client.api";
import {
  LoginRequest,
  LoginRequestSchema,
  LoginResponse,
  LoginResponseSchema,
} from "@/schemas/auth.schema";

export async function login(input: LoginRequest) {
  const payload = LoginRequestSchema.parse(input);

  const { data } = await api.post<LoginResponse>("/auth/login", payload);

  return LoginResponseSchema.parse(data);
}
