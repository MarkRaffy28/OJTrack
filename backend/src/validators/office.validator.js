import { z } from "zod";

export const getOfficeQrSchema = z.object({
  officeId: z.coerce.number().int().positive(),
});