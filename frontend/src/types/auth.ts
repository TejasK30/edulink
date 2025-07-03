import { User } from "@/lib/types"

export type UserRoleType = "admin" | "teacher" | "student"

export interface LoginResponse {
  success: boolean
  message: string
  data?: User
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: "teacher" | "student"
  collegeId: string
}

export interface AdminRegisterData {
  adminName: string
  adminEmail: string
  adminPassword: string
  collegeOption: "existing" | "new"
  existingCollegeId?: string
  collegeName?: string
  collegeLocation?: string
  departments: string[]
}

export type AuthContextType = {
  user: {
    id: string
    role: string
    collegeId: string
  } | null
  isLoading: boolean
  isError?: boolean
  error?: unknown
}
