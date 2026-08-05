import { z } from "zod";

export const OfficeSchema = z.object({
  id: z.number().int().positive(),

  name: z.string().min(1).max(150),

  address: z.string().max(255).nullable(),

  contact_email: z.email().max(150).nullable(),

  contact_phone: z.string().max(20).nullable(),

  morning_in: z.iso.time(),
  morning_out: z.iso.time(),
  afternoon_in: z.iso.time(),
  afternoon_out: z.iso.time(),

  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const CreateOfficeSchema = z.object({
  name: z.string().min(1).max(150),

  address: z.string().max(255).nullable().optional(),

  contact_email: z.email().max(150).nullable().optional(),

  contact_phone: z.string().max(20).nullable().optional(),

  morning_in: z.iso.time().default("08:00:00"),
  morning_out: z.iso.time().default("12:00:00"),
  afternoon_in: z.iso.time().default("13:00:00"),
  afternoon_out: z.iso.time().default("17:00:00"),
});

export const UpdateOfficeSchema = CreateOfficeSchema.partial();

export type Office = z.infer<typeof OfficeSchema>;

export type CreateOfficeInput = z.infer<typeof CreateOfficeSchema>;
export type UpdateOfficeInput = z.infer<typeof UpdateOfficeSchema>;
