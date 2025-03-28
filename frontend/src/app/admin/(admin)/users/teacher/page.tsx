"use client"

import UserListPage from "@/components/userlist"
import { useAppStore } from "@/lib/store"
import { useEffect } from "react"

const TeachersListPage = () => {
  const { currentUser, fetchTeachers, teachers } = useAppStore()

  const collegeId = currentUser?.collegeid

  useEffect(() => {
    if (collegeId) {
      fetchTeachers(collegeId)
    }
  }, [teachers, fetchTeachers, collegeId])

  return <UserListPage role="teacher" users={teachers} />
}

export default TeachersListPage
