import { z } from "zod";

export const updateSettingsSchema = z.object({
  current_academic_year: z.string().optional(),
  current_term: z.string().optional(),
  year_2_required_hours: z.string().optional(),
  year_2_start_date: z.string().optional(),
  year_2_end_date: z.string().optional(),
  year_4_required_hours: z.string().optional(),
  year_4_start_date: z.string().optional(),
  year_4_end_date: z.string().optional(),
});
