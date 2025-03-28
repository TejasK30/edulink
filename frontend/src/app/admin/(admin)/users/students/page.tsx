"use client"

import UserListPage from "@/components/userlist"
import { useAppStore } from "@/lib/store"
import { useEffect } from "react"

const StudentListPage = () => {
  const { currentUser, fetchStudents, students } = useAppStore()

  const collegeId = currentUser?.collegeid

  useEffect(() => {
    if (collegeId) {
      fetchStudents(collegeId)
    }
  }, [collegeId, fetchStudents])

  return <UserListPage role="student" users={students} />
}

export default StudentListPage
