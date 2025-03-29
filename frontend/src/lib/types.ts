export type UserRoleType = "student" | "teacher" | "admin"

export interface User {
  _id: string
  name: string
  email: string
  role: UserRoleType
  collegname: string
  collegeid: string
  department?: string
}

export interface Course {
  _id: string
  collegeId: string
  departmentId: string
  semesterId: string
  teacherId?: string
  name: string
  code: string
  credits: number
  description?: string
  topics: { title: string; description: string }[]
  enrolledStudents: string[]
  capacity?: number
}

export type UserFormData = {
  _id?: string
  name: string
  email: string
  password?: string
  department?: string
}

export type CourseFormData = {
  _id?: string
  name: string
  code: string
  credits: number
  description?: string
  topics?: { title: string; description: string }[]
}
