"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { useAuth } from "@/lib/providers/auth-provider"
import { AssignmentPageCourse, AssignmentPageType } from "@/types/student.types"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"

export default function StudentAssignmentListPage() {
  const { user: currentUser } = useAuth()
  const studentId = currentUser?.id
  const [selectedCourse, setSelectedCourse] = useState<string>("")

  const { data: enrolledCourses = [], isLoading: loadingCourses } = useQuery<
    AssignmentPageCourse[],
    Error
  >({
    queryKey: ["enrolledCourses", studentId],
    queryFn: async () => {
      const res = await api.get<{ courses: AssignmentPageCourse[] }>(
        `/student/${studentId}/enrolled-courses`
      )
      return Array.isArray(res.data.courses) ? res.data.courses : []
    },
    enabled: Boolean(studentId),
  })

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery<
    AssignmentPageType[],
    Error
  >({
    queryKey: ["assignments", selectedCourse],
    queryFn: async () => {
      const res = await api.get<AssignmentPageType[]>(
        `/assignments/course/${selectedCourse}`
      )
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: Boolean(selectedCourse),
  })

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Assignments</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Course</label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="-- Select Course --" />
          </SelectTrigger>
          <SelectContent>
            {loadingCourses ? (
              <SelectItem disabled value="loading">
                Loading courses...
              </SelectItem>
            ) : enrolledCourses.length === 0 ? (
              <SelectItem disabled value="no-courses">
                No courses enrolled.
              </SelectItem>
            ) : (
              enrolledCourses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.code} – {course.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {loadingAssignments ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <p>No assignments available for the selected course.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment._id} className="p-4">
              <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{assignment.name}</p>
                <p className="text-sm">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  By: {assignment.teacherId.name}
                </p>
                <Link href={`/student/assignments/${assignment._id}`}>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    View
                  </button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
