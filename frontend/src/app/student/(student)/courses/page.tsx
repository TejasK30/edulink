"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

// --- 1. Proper TS interfaces ---
interface Semester {
  _id: string
  name: string
  year: number
}

interface Course {
  _id: string
  name: string
  code: string
  credits: number
}

// --- 2. Enrollment page ---
export default function StudentEnrollmentPage() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const studentId = currentUser?.id
  const collegeId = currentUser?.collegeId
  const [selectedSemester, setSelectedSemester] = useState<string>("")

  // 2.1 Fetch available semesters
  const { data: availableSemesters = [], isLoading: loadingSemesters } =
    useQuery<Semester[], Error>({
      queryKey: ["semesters", collegeId],
      queryFn: async () => {
        if (!collegeId) throw new Error("Missing collegeId")
        const res = await api.get<Semester[]>(
          `/student/colleges/${collegeId}/semesters`
        )
        return res.data
      },
      enabled: Boolean(collegeId),
    })

  // 2.2 Fetch available courses for the selected semester
  const { data: courses = [], isLoading: loadingCourses } = useQuery<
    Course[],
    Error
  >({
    queryKey: ["availableCourses", collegeId, selectedSemester],
    queryFn: async () => {
      if (!collegeId || !selectedSemester) throw new Error("Missing params")
      const res = await api.get<Course[]>("/courses/available", {
        params: { collegeId, semesterId: selectedSemester },
      })
      return res.data
    },
    enabled: Boolean(collegeId && selectedSemester),
  })

  // 2.3 Fetch already enrolled courses
  const { data: enrolledCourses = [], isLoading: loadingEnrolled } = useQuery<
    Course[],
    Error
  >({
    queryKey: ["enrolledCourses", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Missing studentId")
      const res = await api.get<{ courses: Course[] }>(
        `/student/${studentId}/enrolled-courses`
      )
      return res.data.courses
    },
    enabled: Boolean(studentId),
  })

  // 2.4 Bulk enroll mutation
  const bulkEnrollMutation = useMutation<
    { message: string; enrollments?: Course[] },
    Error
  >({
    mutationFn: async () => {
      if (!studentId || !collegeId || !selectedSemester) {
        throw new Error("Missing required information.")
      }
      const res = await api.post(`/student/${studentId}/enroll-all`, {
        collegeId,
        semesterId: selectedSemester,
      })
      return res.data
    },
    onSuccess: (data) => {
      toast.success(data.message ?? "Bulk enrollment successful.")
      queryClient.invalidateQueries({
        queryKey: ["enrolledCourses", studentId],
      })
    },
    onError: (err) => {
      toast.error(err.message || "Bulk enrollment failed.")
    },
  })

  const isEnrolling = bulkEnrollMutation.status === "pending"

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* --- Semester Selector --- */}
      <Card>
        <CardHeader>
          <CardTitle>Select Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedSemester} value={selectedSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Select a semester" />
            </SelectTrigger>
            <SelectContent>
              {loadingSemesters ? (
                <SelectItem disabled value="loading">
                  Loading...
                </SelectItem>
              ) : availableSemesters.length === 0 ? (
                <SelectItem disabled value="no-semesters">
                  No semesters available
                </SelectItem>
              ) : (
                availableSemesters.map((sem) => (
                  <SelectItem key={sem._id} value={sem._id}>
                    {sem.name} {sem.year}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {selectedSemester && (
            <div className="mt-4">
              <Button
                onClick={() => bulkEnrollMutation.mutate()}
                disabled={isEnrolling}
              >
                {isEnrolling ? "Enrolling..." : "Enroll in All Courses"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Available Courses --- */}
      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCourses ? (
            <p>Loading courses…</p>
          ) : courses.length === 0 ? (
            <p>No courses available for the selected semester.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* --- Enrolled Courses --- */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingEnrolled ? (
            <p>Loading enrolled courses…</p>
          ) : enrolledCourses.length === 0 ? (
            <p>No enrolled courses.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
