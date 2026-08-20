import z from "zod";

import {
  ChangePasswordRequestSchema,
  ResetPasswordRequestSchema,
} from "@/schemas/auth.schema";
import { getBirthDateRange } from "@/utils/date.util";

export const ChangePasswordValidator = ChangePasswordRequestSchema.refine(
  (data) => data.newPassword === data.newPasswordConfirmation,
  {
    path: ["newPasswordConfirmation"],
    message: "Passwords do not match.",
  },
);

export const ResetPasswordValidator = ResetPasswordRequestSchema.refine(
  (data) => data.password === data.passwordConfirmation,
  {
    path: ["passwordConfirmation"],
    message: "Passwords do not match.",
  },
);

export const registrationValidator = <T extends z.ZodObject<any>>(schema: T) =>
  schema
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      error: "Passwords do not match.",
    })
    .refine(
      (data) => {
        if (!data.birthDate) return true;

        const birthDate = new Date(`${data.birthDate}T00:00:00`);
        const { startDate, endDate } = getBirthDateRange();

        return birthDate >= startDate && birthDate <= endDate;
      },
      {
        path: ["birthDate"],
        error: "Age must be between 17 and 100 years.",
      },
    );
