"use client"

import api from "@/lib/api"
import { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import type React from "react"
import { createContext, useContext, useState } from "react"
import { toast } from "sonner"
import { useAppStore } from "./store"

type UserRoleType = "admin" | "teacher" | "student"

type User = {
  id: string
  name: string
  email: string
  role: UserRoleType
  collegeId?: string
}

type AuthContextType = {
  currentUser: User | null
  isLoading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  registerAdminWithCollege: (data: AdminRegisterData) => Promise<void>
  logout: () => void
}

type RegisterData = {
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
  collegeName?: string | null
  collegeLocation?: string | null
  departments: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, currentUser } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const redirectBasedOnRole = (user: User) => {
    switch (user.role) {
      case "admin":
        router.push("/admin/dashboard")
        break
      case "teacher":
        router.push("/teacher/dashboard")
        break
      case "student":
        router.push("/student/dashboard")
        break
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post<{ user: User }>("/auth/login", {
        email,
        password,
      })

      setUser(response.data.user)

      redirectBasedOnRole(response.data.user)
      toast(`Login successful \nWelcome back, ${response.data.user.name}!`)
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Login failed"
          : "An unexpected error occurred"

      console.error("Login error:", errorMessage)
      toast("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      await api.post("/auth/register", data)

      toast("Registration successful \nYour account has been created")
      router.push("/login")
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Registration failed"
          : "An unexpected error occurred"

      console.error("Registration error:", errorMessage)
      toast("Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const registerAdminWithCollege = async (data: AdminRegisterData) => {
    setIsLoading(true)
    try {
      const payload: Partial<AdminRegisterData> = {
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        collegeOption: data.collegeOption,
        departments: data.departments,
      }

      if (data.collegeOption === "existing") {
        if (!data.existingCollegeId) {
          throw new Error("Existing college must be selected")
        }
        payload.existingCollegeId = data.existingCollegeId
      } else {
        if (!data.collegeName) {
          throw new Error("College name is required for new college")
        }
        payload.collegeName = data.collegeName
        payload.collegeLocation = data.collegeLocation
      }

      await api.post("/auth/register/admin", payload)

      toast(
        "Registration successful \nAdmin and College registration successful"
      )
      router.push("/admin/dashboard")
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Admin registration failed"
          : "An unexpected error occurred"

      console.error("Admin registration error:", errorMessage)
      toast("Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await api.post("/auth/logout")

    setUser(null)
    router.push("/login")
    toast("Logged out")
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        register,
        registerAdminWithCollege,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
