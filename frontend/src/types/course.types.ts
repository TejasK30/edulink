import { courseFormSchema } from "@/lib/schemas/course.schema"
import { z } from "zod"

export type Department = {
  _id: string
  name: string
}

export type Semester = {
  _id: string
  name: string
  year: number
}

export type Teacher = {
  _id: string
  name: string
}

export type Course = {
  _id: string
  name: string
  code: string
  credits: number
  description: string
  departmentId: string
  semesterId: string
  teacherId?: string
  departmentName?: string
  semesterName?: string
  teacherName?: string
}

export type CourseFormData = {
  name: string
  code: string
  credits: string
  description: string
  departmentId: string
  semesterId: string
  teacherId?: string | null
}

export type CourseFormSchemaType = z.infer<typeof courseFormSchema>
