import { z } from "zod";

export const createOfficeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal('')),
  contact_phone: z.string().optional(),
});

export const getOfficeQrSchema = z.object({
  officeId: z.coerce.number().int().positive(),
});

export const officeIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateOfficeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal('')),
  contact_phone: z.string().optional(),
});