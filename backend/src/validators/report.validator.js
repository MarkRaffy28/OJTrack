import { z } from "zod";

export const createReportSchema = z.object({
  studentId:  z.string().regex(/^\d+$/, 'studentId must be a number'),
  ojtId:  z.string().regex(/^\d+$/, 'ojtId must be a number'),
  type: z.enum(['daily', 'weekly', 'monthly', 'midterm', 'final', 'incident']),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD"),
  title: z.string().max(255).nullable().optional(),
  content: z.string().min(1, "Content is required"),
  attachments: z.array(z.object({
    filename: z.string(),
    path: z.string(),
    originalName: z.string(),
    size: z.number()
  })).nullable().optional(),
});

export const deleteReportSchema = z.object({
  reportId: z.coerce.number().int().positive(),
});

export const getReportDetailSchema = z.object({
  reportId: z.coerce.number().int().positive(),
});

export const getReportsSchema = z.object({
  ojtId: z.coerce.number().int().positive(),
});

export const getSupervisorReportsSchema = z.object({
  supervisorId: z.coerce.number().int().positive(),
});

export const updateReportSchema = z.object({
  reportId: z.coerce.number().int().positive(),
  ojtId: z.coerce.number().int().positive(),
  type: z.enum(['daily', 'weekly', 'monthly', 'midterm', 'final', 'incident']),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD"),
  title: z.string().max(255).nullable().optional(),
  content: z.string().min(1, "Content is required"),
  attachments: z.array(z.object({
    filename: z.string(),
    path: z.string(),
    originalName: z.string(),
    size: z.number()
  })).nullable().optional(),
});

export const updateReportStatusSchema = z.object({
  reportId: z.coerce.number().int().positive(),
  status: z.enum(['approved', 'rejected', 'pending']),
  feedback: z.string().nullable().optional(),
});