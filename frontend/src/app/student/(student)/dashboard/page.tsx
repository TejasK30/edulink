"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table"
import { format, formatDistanceToNowStrict } from "date-fns"
import { toast } from "sonner"

interface Course {
  _id: string
  name: string
  code: string
}

interface Assignment {
  _id: string
  title: string
  dueDate: string
  courseId: Course
}

interface Announcement {
  _id: string
  title: string
  content: string
  createdAt: string
}

interface Grade {
  _id: string
  grade: string
  courseId: Course
  createdAt: string
}

interface AttendanceSummary {
  courseName: string
  courseCode: string
  presentCount: number
  absentCount: number
  totalLectures: number
}

interface DashboardData {
  enrolledCourses: Course[]
  upcomingAssignments: Assignment[]
  recentAnnouncements: Announcement[]
  recentGrades: Grade[]
  attendanceSummary: AttendanceSummary[]
}

const StudentDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      const studentId = localStorage.getItem("studentId")
      if (!studentId) {
        router.push("/student/login")
        return
      }
      try {
        const response = await fetch("/api/student/dashboard", {
          headers: {
            "x-student-id": studentId,
          },
        })
        if (response.ok) {
          const data: DashboardData = await response.json()
          setDashboardData(data)
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch dashboard data.")
          toast("Failed to fetch dashboard data.")
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error"
        setError("Error fetching dashboard data: " + errorMessage)
        toast("Error fetching dashboard data: " + errorMessage)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Loading dashboard data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        {error}
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto py-10 text-center">
        No data available.
      </div>
    )
  }

  const {
    enrolledCourses,
    upcomingAssignments,
    recentAnnouncements,
    recentGrades,
    attendanceSummary,
  } = dashboardData

  return (
    <div className="container mx-auto py-10 space-y-8 px-4">
      <h1 className="text-3xl font-bold text-center">Student Dashboard</h1>

      {/* Enrolled Courses */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Enrolled Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {enrolledCourses.map((course) => (
              <Card key={course._id}>
                <CardHeader>
                  <CardTitle>{course.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Code: {course.code}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            No enrolled courses found.
          </p>
        )}
      </section>

      {/* Upcoming Assignments */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Upcoming Assignments</h2>
        {upcomingAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAssignments.map((assignment) => (
              <Card key={assignment._id}>
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                  <p className="text-sm text-gray-500">
                    Due:{" "}
                    {format(
                      new Date(assignment.dueDate),
                      "MMM dd, yyyy hh:mm a"
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Course: {assignment.courseId.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No upcoming assignments.</p>
        )}
      </section>

      {/* Recent Announcements */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Announcements</h2>
        {recentAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <Card key={announcement._id}>
                <CardHeader>
                  <CardTitle>{announcement.title}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNowStrict(
                      new Date(announcement.createdAt),
                      { addSuffix: true }
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {announcement.content.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No recent announcements.</p>
        )}
      </section>

      {/* Recent Grades */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Grades</h2>
        {recentGrades.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Recent Grades</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGrades.map((grade) => (
                  <TableRow key={grade._id}>
                    <TableCell>
                      {grade.courseId.name} ({grade.courseId.code})
                    </TableCell>
                    <TableCell>{grade.grade}</TableCell>
                    <TableCell>
                      {format(new Date(grade.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            No recent grades available.
          </p>
        )}
      </section>

      {/* Attendance Summary */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Attendance Summary (This Month)
        </h2>
        {attendanceSummary.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Monthly Attendance Summary</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Total Lectures</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceSummary.map((summary) => (
                  <TableRow key={summary.courseName}>
                    <TableCell>
                      {summary.courseName} ({summary.courseCode})
                    </TableCell>
                    <TableCell>{summary.presentCount}</TableCell>
                    <TableCell>{summary.absentCount}</TableCell>
                    <TableCell>{summary.totalLectures}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            No attendance data available for this month.
          </p>
        )}
      </section>
    </div>
  )
}

export default StudentDashboardPage
