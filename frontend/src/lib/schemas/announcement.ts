import { z } from "zod"

export const announcementFormSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters long" })
    .max(5000, { message: "Content must not exceed 5000 characters" }),
})
