"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { format, isPast } from "date-fns"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface IDepartment {
  _id: string
  collegeId: string
  name: string
  students: string[]
  teachers: string[]
  subjects: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Topic {
  title: string
  description: string
}

export interface ICourse {
  _id: string
  collegeId: string
  departmentId: string
  semesterId: string
  teacherId?: string
  name: string
  code: string
  credits: number
  description?: string
  topics: Topic[]
  enrolledStudents: string[]
  capacity?: number
  createdAt?: string
  updatedAt?: string
}

interface Assignment {
  _id: string
  title: string
  name: string
  dueDate: string
  createdAt: string
  updatedAt: string
  courseId: string
}

interface CourseAssignments {
  _id: string
  name: string
  assignments: Assignment[]
}

const StudentAssignmentListPage = () => {
  const router = useRouter()
  const { currentUser } = useAppStore()
  const [courseAssignments, setCourseAssignments] = useState<
    CourseAssignments[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [departmentCourses, setDepartmentCourses] = useState<ICourse[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<
    string | undefined
  >(undefined)
  const [studentDepartment, setStudentDepartment] =
    useState<IDepartment | null>(null)

  useEffect(() => {
    const fetchStudentDepartment = async () => {
      if (currentUser?._id && currentUser.department) {
        try {
          const response = await api.get(
            `/student/department/${currentUser.department}`
          )
          if (response.status === 200) {
            setStudentDepartment(response.data)
          } else {
            console.error("Failed to fetch student department")
          }
        } catch (error) {
          console.error("Error fetching student department:", error)
        }
      }
    }

    fetchStudentDepartment()
  }, [currentUser?._id, currentUser.department])

  useEffect(() => {
    const fetchCoursesInDepartment = async () => {
      if (studentDepartment?._id) {
        try {
          const response = await api.get(
            `/student/department/${studentDepartment._id}/courses`
          )
          if (response.status === 200) {
            setDepartmentCourses(response.data)
          } else {
            console.error("Failed to fetch courses in department")
          }
        } catch (error) {
          console.error("Error fetching courses in department:", error)
        }
      }
    }

    fetchCoursesInDepartment()
  }, [studentDepartment?._id])

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!currentUser?._id) {
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(
          `/student/assignments/${currentUser._id}${
            selectedSubjectId ? `?subjectId=${selectedSubjectId}` : ""
          }`
        )
        if (response.status === 200) {
          setCourseAssignments(response.data)
        } else {
          setError("Failed to fetch assignments.")
        }
      } catch (error: any) {
        setError(error.message || "An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [currentUser?._id, selectedSubjectId])

  const getAssignmentStatus = (dueDate: string): "Upcoming" | "Overdue" => {
    const dueDateObj = new Date(dueDate)
    return isPast(dueDateObj) ? "Overdue" : "Upcoming"
  }

  return (
    <div className="w-full min-h-screen py-6">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {departmentCourses.length > 0 && (
            <Select
              onValueChange={(value) =>
                setSelectedSubjectId(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {departmentCourses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          My Assignments
        </h1>
        <p className="text-muted-foreground mb-6">
          View assignments for your enrolled courses within your department.
        </p>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-32" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && courseAssignments.length === 0 && (
          <p>No assignments found for your enrolled courses.</p>
        )}

        {!loading && !error && courseAssignments.length > 0 && (
          <div className="space-y-8">
            {courseAssignments.map((course) => (
              <div key={course._id}>
                <h2 className="text-xl font-semibold mb-3">{course.name}</h2>
                {course.assignments.length === 0 ? (
                  <p className="text-muted-foreground">
                    No assignments for this course yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {course.assignments
                      .filter((assignment) =>
                        selectedSubjectId
                          ? assignment.courseId === selectedSubjectId
                          : true
                      )
                      .map((assignment) => (
                        <Card key={assignment._id}>
                          <CardHeader>
                            <CardTitle>{assignment.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {assignment.name}
                            </p>
                            <p className="text-sm">
                              Due Date:{" "}
                              {format(
                                new Date(assignment.dueDate),
                                "PPP HH:mm"
                              )}
                            </p>
                            <p className="text-sm font-semibold">
                              Status:{" "}
                              <span
                                className={cn({
                                  "text-green-500":
                                    getAssignmentStatus(assignment.dueDate) ===
                                    "Upcoming",
                                  "text-red-500":
                                    getAssignmentStatus(assignment.dueDate) ===
                                    "Overdue",
                                })}
                              >
                                {getAssignmentStatus(assignment.dueDate)}
                              </span>
                            </p>
                            {/* You can add a "View Details" button here if needed */}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentAssignmentListPage
