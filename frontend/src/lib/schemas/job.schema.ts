import { z } from "zod"

export const jobSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  applyLink: z.string().url("Enter a valid URL"),
  jobDescription: z.string().min(1, "Job description is required"),
  location: z.string().optional(),
  jobType: z.enum(["Full-time", "Part-time", "Internship", "Contract"]),
  deadline: z.string().optional(),
})
