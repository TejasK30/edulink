import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const userRegistrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "teacher"]),
  collegeId: z.string(),
  departmentId: z.string().optional(),
})

export const adminRegistrationSchema = z.object({
  adminName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),
  adminEmail: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  adminPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  collegeOption: z.enum(["existing", "new"]).default("existing"),
  existingCollegeId: z.string().optional(),
  collegeName: z.string().optional().nullable(),
  collegeLocation: z.string().optional().nullable(),
  departments: z.array(z.string()).optional().nullable(),
})
