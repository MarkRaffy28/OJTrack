import { ChangePasswordRequestSchema, ResetPasswordRequestSchema } from "@/schemas/auth.schema";

export const ChangePasswordValidator = ChangePasswordRequestSchema.refine(
  (data) => data.new_password === data.new_password_confirmation,
  {
    path: ["new_password_confirmation"],
    message: "Passwords do not match.",
  },
);

export const ResetPasswordValidator = ResetPasswordRequestSchema.refine(
  (data) => data.password === data.password_confirmation,
  {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  },
);
