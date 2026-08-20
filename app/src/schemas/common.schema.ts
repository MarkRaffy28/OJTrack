import { z } from "zod";

export const ContactNumberSchema = z
  .string()
  .min(1, "Contact Number is required")
  .regex(/^09\d{9}$/, "Enter a valid Philippine mobile number");

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(255, "Password must be at most 255 characters long")
  .regex(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    "Password must contain uppercase, lowercase, number, and special character",
  );
