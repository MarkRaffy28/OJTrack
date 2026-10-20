import { z } from "zod";

const OfficeTimeSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined || value === "") return null;

    const text = String(value);
    const match = text.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);

    return match ? `${match[1].padStart(2, "0")}:${match[2]}:00` : text;
  },
  z.string().nullable(),
);

export const OfficeSchema = z.object({
  name: z.string().min(1).max(150),

  address: z.string().max(255).nullable(),

  // Nullable database fields may arrive as empty strings from older records.
  contactEmail: z.preprocess(
    (value) => value === "" ? null : value,
    z.email().max(150).nullable(),
  ),

  contactPhone: z.string().max(20).nullable(),

  morningIn: OfficeTimeSchema,
  morningOut: OfficeTimeSchema,
  afternoonIn: OfficeTimeSchema,
  afternoonOut: OfficeTimeSchema,
});

export type Office = z.infer<typeof OfficeSchema>;
