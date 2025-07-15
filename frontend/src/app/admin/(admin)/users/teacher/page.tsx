"use client"

import React from "react"
import api from "@/lib/api"
import { useAuth } from "@/lib/providers/auth-provider"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import UserListPage from "@/components/userlist"
import { User } from "@/lib/schemas/user.schema"
import { UserRoleType } from "@/lib/types"

const TeachersListPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth()
  const collegeId = user?.collegeId

  const {
    data: teachers = [],
    isLoading: teachersLoading,
    isError: teachersError,
    error,
  } = useQuery<User[], Error>({
    queryKey: ["teachers", collegeId],
    queryFn: async () => {
      const res = await api.get<User[]>(`/admin/users/teachers/${collegeId}`)
      return res.data
    },
    enabled: !!collegeId,
    placeholderData: keepPreviousData,
  })

  if (authLoading) {
    return <div className="p-4 text-center">Loading user…</div>
  }

  if (!collegeId) {
    return (
      <div className="p-4 text-center text-red-600">
        Error: no college selected.
      </div>
    )
  }

  if (teachersLoading) {
    return <div className="p-4 text-center">Loading teachers…</div>
  }

  if (teachersError) {
    return (
      <div className="p-4 text-center text-red-600">
        {error?.message || "Failed to load teachers."}
      </div>
    )
  }

  return <UserListPage role={"teacher" as UserRoleType} users={teachers} />
}

export default TeachersListPage
