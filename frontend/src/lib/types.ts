import { ReactNode } from "react"

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
export interface Department {
  _id: string
  name: string
  collegeId: string
}

export interface Course {
  _id: string
  name: string
  code: string
  credits: number
  description?: string
  teacherId?: string
  departmentId: string
  collegeId: string
  semesterId: string
}

export interface Announcement {
  _id: string
  title: string
  content: string
  authorId: {
    _id: string
    name: string
  }
  authorRole: "admin" | "teacher"
  createdAt: string
  collegeId: {
    _id: string
    name: string
  }
  departmentId?: {
    _id: string
    name: string
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface Feature {
  title: string
  description: string
  icon: string
  id: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  message: string
  avatarUrl?: string
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  isPopular?: boolean
  buttonText: string
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  isExternal?: boolean
}

export interface Step {
  number: number
  label: string
}

export interface ProgressBarProps {
  steps: Step[]
  currentStep: number
}

export interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  change: string
}

export interface TitleSectionProps {
  title: string
  subheading?: string
  pill: string
}
