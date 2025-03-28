"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Course {
  _id: string
  name: string
  code: string
}

interface Assignment {
  _id: string
  title: string
  dueDate: string
}

interface Announcement {
  _id: string
  title: string
  content: string
  createdAt: string
}

const TeacherDashboardPage = () => {
  // Initialize states as arrays
  const [coursesTeaching, setCoursesTeaching] = useState<Course[]>([])
  const [upcomingAssignmentsToGrade, setUpcomingAssignmentsToGrade] = useState<
    Assignment[]
  >([])
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    Announcement[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      const teacherId = localStorage.getItem("teacherId")
      if (!teacherId) {
        router.push("/teacher/login")
        return
      }
      try {
        const response = await fetch(
          "http://localhost:5000/api/teacher/dashboard-data",
          {
            headers: {
              "x-teacher-id": teacherId,
            },
          }
        )
        if (response.ok) {
          const data = await response.json()
          setCoursesTeaching(data.coursesTeaching || [])
          setUpcomingAssignmentsToGrade(data.upcomingAssignmentsToGrade || [])
          setRecentAnnouncements(data.recentAnnouncements || [])
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch dashboard data.")
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
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Teacher Dashboard</h1>

      {/* Courses Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Courses You Are Teaching
        </h2>
        {coursesTeaching.length > 0 ? (
          <ul className="space-y-2">
            {coursesTeaching.map((course: Course) => (
              <li
                key={course._id}
                className="p-4 bg-white rounded shadow flex justify-between items-center"
              >
                <span className="font-medium">{course.name}</span>
                <span className="text-gray-500">({course.code})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No courses assigned to you yet.</p>
        )}
      </section>

      {/* Assignments Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Upcoming Assignments to Grade
        </h2>
        {upcomingAssignmentsToGrade.length > 0 ? (
          <ul className="space-y-2">
            {upcomingAssignmentsToGrade.map((assignment: Assignment) => (
              <li
                key={assignment._id}
                className="p-4 bg-white rounded shadow flex justify-between items-center"
              >
                <span className="font-medium">{assignment.title}</span>
                <span className="text-gray-500">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming assignments to grade.</p>
        )}
      </section>

      {/* Announcements Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Announcements</h2>
        {recentAnnouncements.length > 0 ? (
          <ul className="space-y-4">
            {recentAnnouncements.map((announcement: Announcement) => (
              <li
                key={announcement._id}
                className="p-4 bg-gray-100 rounded shadow"
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
          <p>No recent announcements.</p>
        )}
      </section>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={() => router.push("/teacher/assignments/create")}>
          Create Assignment
        </Button>
        {/* Additional teacher functionalities can be added here */}
      </div>
    </div>
  )
}

export default TeacherDashboardPage
