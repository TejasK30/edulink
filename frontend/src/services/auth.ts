import api from "@/lib/api"
import { User } from "@/lib/types"
import { AxiosError } from "axios"
import { toast } from "sonner"

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

type RegisterData = {
  name: string
  email: string
  password: string
  role: "teacher" | "student"
  collegeId: string
}

type LoginResponse =
  | { success: true; message: string; data?: User }
  | { success: false; message: string; data?: never }

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    })
    return {
      success: true,
      message: "Login successful",
      data: response.data.user,
    }
  } catch (error) {
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || "Login failed"
        : "An unexpected error occurred"
    console.error("Login error:", errorMessage)
    toast("Login failed")
    return { success: false, message: errorMessage }
  }
}

export const register = async (data: RegisterData) => {
  try {
    await api.post("/auth/register", data)
    toast("Registration successful \nYour account has been created")
  } catch (error) {
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || "Registration failed"
        : "An unexpected error occurred"
    console.error("Registration error:", errorMessage)
    toast("Registration failed")
  }
}

export const registerAdminWithCollege = async (data: AdminRegisterData) => {
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

    return { success: true }
  } catch (error) {
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || "Admin registration failed"
        : "An unexpected error occurred"
    console.error("Admin registration error:", errorMessage)
    toast("Registration failed")
    return { success: false, message: errorMessage }
  }
}

export const logout = async () => {
  try {
    console.log("in log out function")
    await api.post("/auth/logout")
    toast("Logged out")
  } catch (error) {
    console.log(error)
    toast("failed to log out")
  }
}
