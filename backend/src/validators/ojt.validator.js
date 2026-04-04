import { z } from "zod";

export const getOjtsSchema = z.object({
  role: z.enum(["student", "supervisor"]),
  databaseId: z.coerce.number().int().positive(),
});