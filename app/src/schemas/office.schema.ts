import { z } from "zod";

export const OfficeSchema = z.object({
  id: z.number().int().positive(),

  name: z.string().min(1).max(150),

  address: z.string().max(255).nullable(),

  contactEmail: z.email().max(150).nullable(),

  contactPhone: z.string().max(20).nullable(),

  morningIn: z.iso.time(),
  morningOut: z.iso.time(),
  afternoonIn: z.iso.time(),
  afternoonOut: z.iso.time(),

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const CreateOfficeSchema = z.object({
  name: z.string().min(1).max(150),

  address: z.string().max(255).nullable().optional(),

  contactEmail: z.email().max(150).nullable().optional(),

  contactPhone: z.string().max(20).nullable().optional(),

  morningIn: z.iso.time().default("08:00:00"),
  morningOut: z.iso.time().default("12:00:00"),
  afternoonIn: z.iso.time().default("13:00:00"),
  afternoonOut: z.iso.time().default("17:00:00"),
});

export const UpdateOfficeSchema = CreateOfficeSchema.partial();

export type Office = z.infer<typeof OfficeSchema>;

export type CreateOfficeInput = z.infer<typeof CreateOfficeSchema>;
export type UpdateOfficeInput = z.infer<typeof UpdateOfficeSchema>;
