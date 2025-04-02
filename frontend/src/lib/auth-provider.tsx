"use client"

import api from "@/lib/api"
import { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import React, { createContext, useContext, useState } from "react"
import { toast } from "sonner"
import { useAppStore } from "./store"
import { User } from "./store"

export type UserRoleType = "admin" | "teacher" | "student"

type AuthContextType = {
  currentUser: User
  isLoading: boolean
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<{ success: boolean; message?: string } | void>
  register: (data: RegisterData) => Promise<void>
  registerAdminWithCollege: (
    data: AdminRegisterData
  ) => Promise<{ success: boolean; message?: string } | void>
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
    if (!user) return
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

  const login = async (email: string, password: string, remember?: boolean) => {
    setIsLoading(true)
    try {
      const response = await api.post<{ user: any }>("/auth/login", {
        email,
        password,
      })

      setUser(response.data.user)
      toast(`Login successful \nWelcome back, ${response.data.user.name}!`)
      redirectBasedOnRole(response.data.user)
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Login failed"
          : "An unexpected error occurred"
      console.error("Login error:", errorMessage)
      toast("Login failed")
      return { success: false, message: errorMessage }
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

      const response = await api.post("/auth/register/admin", payload)
      if (response.data && response.data.success === false) {
        toast(response.data.message || "Registration failed")
        return { success: false, message: response.data.message }
      }

      toast(
        "Registration successful \nAdmin and College registration successful"
      )
      router.push("/admin/dashboard")
      return { success: true }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Admin registration failed"
          : "An unexpected error occurred"
      console.error("Admin registration error:", errorMessage)
      toast("Registration failed")
      return { success: false, message: errorMessage }
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
