import { z } from "zod";
import { OjtSchema } from "./ojt.schema";
import { UserSchema } from "./user.schema";

export const ActivitySchema = z.object({
  id: z.number().int().positive(),

  user: UserSchema,
  ojt: OjtSchema.nullable(),

  action: z.string().min(1).max(50),
  target_id: z.number().int().positive().nullable(),
  target_type: z.string().max(50).nullable(),

  description: z.string().nullable(),

  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type Activity = z.infer<typeof ActivitySchema>;
