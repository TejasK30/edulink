"use client"

import UserListPage from "@/components/userlist"
import { useAppStore } from "@/lib/store"
import { useEffect } from "react"

const AdminsListPage = () => {
  const { currentUser, fetchAdmins, admins } = useAppStore()

  const collegeId = currentUser?.collegeid

  useEffect(() => {
    if (collegeId) {
      fetchAdmins(collegeId)
    }
  }, [collegeId, fetchAdmins])

  return <UserListPage role="admin" users={admins} />
}

export default AdminsListPage
