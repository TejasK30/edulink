"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Announcement {
  _id: string
  title: string
  content: string
  createdAt: string
}

const AdminDashboardPage = () => {
  const [studentCount, setStudentCount] = useState<number>(0)
  const [teacherCount, setTeacherCount] = useState<number>(0)
  const [courseCount, setCourseCount] = useState<number>(0)
  const [departmentCount, setDepartmentCount] = useState<number>(0)
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    Announcement[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { currentUser } = useAppStore()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get("/admin/dashboard-data")

        if (response.status === 200) {
          setStudentCount(response.data.studentCount)
          setTeacherCount(response.data.teacherCount)
          setCourseCount(response.data.courseCount)
          setDepartmentCount(response.data.departmentCount)
          setRecentAnnouncements(response.data.recentAnnouncements)
        } else {
          setError("Failed to fetch dashboard data.")
        }
      } catch (error) {
        setError("Error fetching dashboard data.")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard data...
      </div>
    )
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    )

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center">{studentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center">{teacherCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center">{courseCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center">{departmentCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Announcements</h2>
        {recentAnnouncements && recentAnnouncements.length > 0 ? (
          <ul className="space-y-4">
            {recentAnnouncements.map((announcement: Announcement) => (
              <li
                key={announcement._id}
                className="p-4 bg-gray-100 rounded-lg shadow"
              >
                <h3 className="text-xl font-semibold">{announcement.title}</h3>
                <p className="mt-2 text-gray-700">
                  {announcement.content.substring(0, 100)}...
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No recent announcements.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={() => router.push("/admin/teachers")}>
          Manage Teachers
        </Button>
        <Button onClick={() => router.push("/admin/students")}>
          Manage Students
        </Button>
        <Button onClick={() => router.push("/admin/admins")}>
          Manage Admins
        </Button>
        <Button onClick={() => router.push("/admin/courses")}>
          Manage Courses
        </Button>
        <Button onClick={() => router.push("/admin/departments")}>
          Manage Departments
        </Button>
      </div>
    </div>
  )
}

export default AdminDashboardPage
