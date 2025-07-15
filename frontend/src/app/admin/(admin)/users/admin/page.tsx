"use client"

import UserListPage from "@/components/userlist"
import api from "@/lib/api"
import { useAuth } from "@/lib/providers/auth-provider"
import { useQuery } from "@tanstack/react-query"

const AdminsListPage = () => {
  const { user } = useAuth()

  const {
    data: admins = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admins", user?.collegeId],
    queryFn: async () => {
      const response = await api.get(`/admin/users/admins/${user?.collegeId}`)
      return response.data
    },
    enabled: !!user?.collegeId, // only run if collegeId exists
  })

  if (!user || !user.collegeId) {
    return <div className="p-8 text-center">Loading user data...</div>
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading admins...</div>
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">Failed to load admins.</div>
    )
  }

  return <UserListPage role="admin" users={admins} />
}

export default AdminsListPage
