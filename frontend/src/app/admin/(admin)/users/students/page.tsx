"use client"

import React from "react"
import api from "@/lib/api"
import { useAuth } from "@/lib/providers/auth-provider"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import UserListPage from "@/components/userlist"
import { User } from "@/lib/schemas/user.schema"
import { UserRoleType } from "@/lib/types"

const StudentListPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth()
  const collegeId = user?.collegeId

  const {
    data: students = [],
    isLoading: studentsLoading,
    isError: studentsError,
    error,
  } = useQuery<User[], Error>({
    queryKey: ["students", collegeId],
    queryFn: async () => {
      const res = await api.get<User[]>(`/admin/users/students/${collegeId}`)
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

  if (studentsLoading) {
    return <div className="p-4 text-center">Loading students…</div>
  }

  if (studentsError) {
    return (
      <div className="p-4 text-center text-red-600">
        {error?.message || "Failed to load students."}
      </div>
    )
  }

  return <UserListPage role={"student" as UserRoleType} users={students} />
}

export default StudentListPage
