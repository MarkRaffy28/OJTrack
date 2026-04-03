import { z } from "zod";

export const fetchOjtsSchema = z.object({
  role: z.enum(["student", "supervisor"]),
  databaseId: z.coerce.number().int().positive(),
});