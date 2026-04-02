import { z } from "zod";

export const fetchStudentOjtsSchema = z.object({
  databaseId: z.coerce.number().int().positive(),
});