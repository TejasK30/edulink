import { z } from "zod"

export const courseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  credits: z.number(),
  collegeId: z.string(),
  departmentId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const courseArraySchema = z.array(courseSchema)

export type Course = z.infer<typeof courseSchema>
