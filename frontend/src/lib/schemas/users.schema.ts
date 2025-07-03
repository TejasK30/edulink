import * as z from "zod"

export const userFormSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .optional(),
  department: z.string().optional(),
})

export type UserFormValues = z.infer<typeof userFormSchema>

export interface DetailedUser {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
  department?: { _id: string; name: string }
  enrolledCourses?: {
    _id: string
    name: string
    code: string
    credits: number
  }[]
  attendance?: {
    _id: string
    courseId: { _id: string; name: string; code: string }
    date: string
    status: string
  }[]
  grades?: {
    _id: string
    courseId: { _id: string; name: string; code: string }
    gradeValue: number
    gradeType: string
    updatedAt: string
  }[]
  teachingCourses?: {
    _id: string
    name: string
    code: string
    credits: number
    enrolledStudents: number
  }[]
  feedbacks?: {
    _id: string
    rating: number
    message: string
    createdAt: string
  }[]
}

export interface User {
  _id: string
  name: string
  email: string
  role: string
  department?: { _id: string; name: string }
}

export interface Department {
  _id: string
  name: string
}

export interface UserFormData {
  _id?: string
  name: string
  email: string
  password?: string
  department?: string
}
