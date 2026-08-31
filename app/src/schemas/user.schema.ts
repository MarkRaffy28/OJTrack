import { z } from "zod";
import { OfficeSchema } from "./office.schema";
import { ContactNumberSchema } from "./common.schema";

export const GenderSchema = z.enum(["Male", "Female", "Other"]);

export const RoleSchema = z.enum(["student", "instructor", "supervisor", "admin"]);

export const StatusSchema = z.enum(["pre_activated", "active", "suspended"]);

export const StudentDetailSchema = z.object({
  year: z.number().int().min(1, "Year is required").max(10),

  program: z
    .string()
    .min(1, "Program is required")
    .max(100, "Program must be at most 100 characters long"),

  major: z
    .string()
    .min(1, "Major is required")
    .max(100, "Major must be at most 100 characters long"),

  section: z
    .string()
    .min(1, "Section is required")
    .max(10, "Section must be at most 10 characters long"),
});

export const InstructorDetailSchema = z.object({
  department: z.string().min(1).max(100),
  section: z.string().min(1).max(10),
});

export const SupervisorDetailSchema = z.object({
  position: z.string().min(1).max(255),
  office: OfficeSchema,
});

export const EmergencyContactSchema = z.object({
  id: z.number(),

  name: z
    .string()
    .min(1, "Name is required")
    .max(210, "Name must be at most 210 characters long"),

  relationship: z
    .string()
    .min(1, "Relationship is required")
    .max(50, "Relationship must be at most 50 characters long"),

  contactNumber: ContactNumberSchema,

  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must be at most 255 characters long"),

  isPrimary: z.boolean(),
});

export const BaseUserSchema = z.object({
  id: z.number().int().positive(),

  username: z
    .string()
    .min(1, "Username is required")
    .max(100, "Username must be at most 100 characters long"),

  profilePicture: z.string().nullable(),

  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First must be at most 100 characters long"),

  middleName: z
    .string()
    .max(50, "Middle name must be at most 50 characters long")
    .nullable(),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters long"),

  extensionName: z
    .string()
    .max(10, "Extension name must be at most 10 characters long")
    .nullable(),

  fullName: z.string().nullable(),

  userId: z.string().min(1).max(50),

  birthDate: z
    .string()
    .min(1, "Birthdate is required")
    .pipe(z.iso.date("Invalid birth date")),

  gender: GenderSchema,

  homeAddress: z
    .string()
    .min(1, "Home address is required")
    .max(255, "Home address must be at most 255 characters long"),

  presentAddress: z
    .string()
    .min(1, "Present address is required")
    .max(255, "Present address must be at most 255 characters long"),

  contactNumber: ContactNumberSchema,

  email: z
    .email("Invalid email address")
    .min(1, "Email is required")
    .max(100, "Email must be at most 100 characters long"),

  emailVerifiedAt: z.iso.datetime().nullable(),

  status: StatusSchema,
  activatedAt: z.iso.datetime().nullable(),

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const StudentUserSchema = BaseUserSchema.extend({
  role: z.literal("student"),
  studentDetail: StudentDetailSchema,
  emergencyContacts: z.array(EmergencyContactSchema),
});

export const InstructorUserSchema = BaseUserSchema.extend({
  role: z.literal("instructor"),
  instructorDetail: InstructorDetailSchema,
});

export const SupervisorUserSchema = BaseUserSchema.extend({
  role: z.literal("supervisor"),
  supervisorDetail: SupervisorDetailSchema,
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

export const UserResponseSchema = z.object({
  user: UserSchema,
});

export const UpdateProfilePictureRequestSchema = z.instanceof(FormData);

export const UpdatePersonalInformationRequestSchema = BaseUserSchema.pick({
  username: true,
  firstName: true,
  middleName: true,
  lastName: true,
  extensionName: true,
  birthDate: true,
  gender: true,
  homeAddress: true,
  presentAddress: true,
  contactNumber: true,
  email: true,
});

export const UpdateEmergencyContactRequestSchema = z.object({
  emergencyContact: EmergencyContactSchema.omit({
    id: true,
    isPrimary: true,
  }),
});

export type Gender = z.infer<typeof GenderSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Status = z.infer<typeof StatusSchema>;

export type StudentDetail = z.infer<typeof StudentDetailSchema>;
export type InstructorDetail = z.infer<typeof InstructorDetailSchema>;
export type SupervisorDetail = z.infer<typeof SupervisorDetailSchema>;

export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;

export type BaseUser = z.infer<typeof BaseUserSchema>;

export type StudentUser = z.infer<typeof StudentUserSchema>;
export type InstructorUser = z.infer<typeof InstructorUserSchema>;
export type SupervisorUser = z.infer<typeof SupervisorUserSchema>;
export type AdminUser = z.infer<typeof AdminUserSchema>;

export type User = z.infer<typeof UserSchema>;

export type UserResponse = z.infer<typeof UserResponseSchema>;

export type UpdatePersonalInformationRequest = z.infer<
  typeof UpdatePersonalInformationRequestSchema
>;

export type UpdateEmergencyContactRequest = z.infer<
  typeof UpdateEmergencyContactRequestSchema
>;
