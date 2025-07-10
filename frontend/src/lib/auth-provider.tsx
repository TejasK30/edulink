"use client"

import { AuthContextType } from "@/types/auth"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import React, { createContext, useContext } from "react"
import api from "./api"
import { useRouter } from "next/navigation"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["auth-get-user"],
    queryFn: async () => {
      console.log("Fetching user profile...")
      try {
        const response = await api.get("/auth/profile/me")
        console.log("User profile response:", response.data)
        return response.data.user
      } catch (error) {
        console.error("Error fetching user profile:", error)
        throw error
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const logout = async () => {
    try {
      await api.post("/auth/logout")
      await queryClient.invalidateQueries({ queryKey: ["auth-get-user"] })
      router.push("/login") // ✅ redirect after logout
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isError,
    error,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
