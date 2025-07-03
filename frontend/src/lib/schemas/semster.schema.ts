import { z } from "zod"

export type Department = {
  _id: string
  name: string
}

export type Semester = {
  _id: string
  name: string
  year: number
  departmentId: string
  startDate: string
  endDate: string
  isActive: boolean
}

export const semesterFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Semester name must be at least 2 characters." }),
    year: z.string().refine((val) => !isNaN(parseInt(val)), {
      message: "Year must be a valid number.",
    }),
    departmentId: z.string().min(1, { message: "Please select a department." }),
    startDate: z.date({ required_error: "Please select a start date." }),
    endDate: z.date({ required_error: "Please select an end date." }),
    isActive: z.boolean().default(false),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
