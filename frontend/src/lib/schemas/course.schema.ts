import * as z from "zod"

export const courseFormSchema = z.object({
  name: z.string().min(2, {
    message: "Course name must be at least 2 characters.",
  }),
  code: z.string().min(2, {
    message: "Course code must be at least 2 characters.",
  }),
  credits: z
    .string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "Credits must be a positive number.",
    }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  departmentId: z.string().min(1, {
    message: "Please select a department.",
  }),
  semesterId: z.string().min(1, {
    message: "Please select a semester.",
  }),
  teacherId: z.string().nullable().optional(),
})
