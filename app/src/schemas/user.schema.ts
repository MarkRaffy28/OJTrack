import { z } from "zod";
import { OfficeSchema } from "./office.schema";

export const GenderSchema = z.enum(["Male", "Female", "Other"]);

export const RoleSchema = z.enum(["student", "instructor", "supervisor", "admin"]);

export const StatusSchema = z.enum(["pre_activated", "active", "suspended"]);

export const StudentDetailSchema = z.object({
  year: z.coerce.number().int().min(1).max(10),
  program: z.string().min(1).max(100),
  major: z.string().min(1).max(100),
  section: z.string().min(1).max(10),
});

export const InstructorDetailSchema = z.object({
  department: z.string().min(1).max(100),
  section: z.string().min(1).max(10),
});

export const SupervisorDetailSchema = z.object({
  position: z.string().min(1).max(255),
  office: OfficeSchema,
});

const BaseUserSchema = z.object({
  id: z.number().int().positive(),

  username: z.string().min(1).max(100),

  profile_picture: z.string().nullable(),

  first_name: z.string().min(1).max(100),
  middle_name: z.string().max(50).nullable(),
  last_name: z.string().min(1).max(50),
  extension_name: z.string().max(10).nullable(),
  full_name: z.string().nullable(),

  user_id: z.string().min(1).max(50),

  birth_date: z.iso.date(),

  gender: GenderSchema,

  address: z.string().max(255),
  contact_number: z.string().max(15),

  email: z.email().max(100),
  email_verified_at: z.iso.datetime().nullable(),

  status: StatusSchema,
  activated_at: z.iso.datetime().nullable(),

  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const StudentUserSchema = BaseUserSchema.extend({
  role: z.literal("student"),
  student_detail: StudentDetailSchema,
});

export const InstructorUserSchema = BaseUserSchema.extend({
  role: z.literal("instructor"),
  instructor_detail: InstructorDetailSchema,
});

export const SupervisorUserSchema = BaseUserSchema.extend({
  role: z.literal("supervisor"),
  supervisor_detail: SupervisorDetailSchema,
});

export const AdminUserSchema = BaseUserSchema.extend({
  role: z.literal("admin"),
});

export const UserSchema = z.discriminatedUnion("role", [
  StudentUserSchema,
  InstructorUserSchema,
  SupervisorUserSchema,
  AdminUserSchema,
]);

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(8),

  first_name: z.string().min(1).max(100),
  middle_name: z.string().max(50).nullable().optional(),
  last_name: z.string().min(1).max(50),
  extension_name: z.string().max(10).nullable().optional(),

  user_id: z.string().min(1).max(50),

  birth_date: z.iso.date(),

  gender: GenderSchema,

  address: z.string().max(255),
  contact_number: z.string().max(20),

  email: z.email().max(100),

  role: RoleSchema,

  profile_picture: z.string().nullable().optional(),
});

export const UpdateUserSchema = CreateUserSchema.omit({
  password: true,
}).partial();

export type Gender = z.infer<typeof GenderSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Status = z.infer<typeof StatusSchema>;

export type StudentDetail = z.infer<typeof StudentDetailSchema>;
export type InstructorDetail = z.infer<typeof InstructorDetailSchema>;
export type SupervisorDetail = z.infer<typeof SupervisorDetailSchema>;

export type StudentUser = z.infer<typeof StudentUserSchema>;
export type InstructorUser = z.infer<typeof InstructorUserSchema>;
export type SupervisorUser = z.infer<typeof SupervisorUserSchema>;
export type AdminUser = z.infer<typeof AdminUserSchema>;

export type User = z.infer<typeof UserSchema>;

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
