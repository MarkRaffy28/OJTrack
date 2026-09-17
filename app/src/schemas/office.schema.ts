import { z } from "zod";

export const OfficeSchema = z.object({
  name: z.string().min(1).max(150),

  address: z.string().max(255).nullable(),

  contactEmail: z.email().max(150).nullable(),

  contactPhone: z.string().max(20).nullable(),

  morningIn: z.string().nullable(),
  morningOut: z.string().nullable(),
  afternoonIn: z.string().nullable(),
  afternoonOut: z.string().nullable(),
});

export type Office = z.infer<typeof OfficeSchema>;
