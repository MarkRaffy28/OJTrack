import { z } from "zod";

export const supervisorStatsSchema = z.object({
  supervisorId: z.coerce.number().int().positive(),
});