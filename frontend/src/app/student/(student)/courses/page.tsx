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
import { useAppStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function StudentEnrollmentPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [availableSemesters, setAvailableSemesters] = useState<any[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")

  const { currentUser } = useAppStore()
  const studentId = currentUser?._id
  const collegeId = currentUser?.collegeid

  useEffect(() => {
    if (!collegeId) {
      toast("College ID is missing.")
      return
    }
    async function fetchSemesters() {
      try {
        const response = await api.get(`/admin/colleges/${collegeId}/semesters`)
        setAvailableSemesters(response.data)
      } catch (error: any) {
        toast("Failed to load semesters.")
      }
    }
    fetchSemesters()
  }, [collegeId])

  useEffect(() => {
    if (!collegeId || !selectedSemester) return
    async function fetchCourses() {
      try {
        console.log(
          "Fetching courses for collegeId:",
          collegeId,
          "semesterId:",
          selectedSemester
        )
        const response = await api.get("/courses/available", {
          params: { collegeId, semesterId: selectedSemester },
        })
        console.log("Courses:", response.data)
        setCourses(response.data)
      } catch (error: any) {
        toast(error.response?.data?.message || "Failed to load courses")
      }
    }
    fetchCourses()
  }, [collegeId, selectedSemester])

  useEffect(() => {
    if (!studentId) return
    async function fetchEnrolledCourses() {
      try {
        const response = await api.get(`/student/${studentId}/enrolled-courses`)
        setEnrolledCourses(response.data.courses)
      } catch (error: any) {
        toast(
          error.response?.data?.message || "Failed to load enrolled courses"
        )
      }
    }
    fetchEnrolledCourses()
  }, [studentId])

  async function bulkEnroll() {
    if (!studentId || !collegeId || !selectedSemester) {
      toast("Missing required information.")
      return
    }
    try {
      const response = await api.post(`/student/${studentId}/enroll-all`, {
        collegeId,
        semesterId: selectedSemester,
      })
      toast(response.data.message || "Bulk enrollment successful.")

      if (response.data && response.data.enrollments?.length > 0) {
        const enrolledResponse = await api.get(
          `/student/${studentId}/enrolled-courses`
        )
        setEnrolledCourses(enrolledResponse.data)
      }
    } catch (error: any) {
      toast(
        error.response?.data?.message ||
          "Bulk enrollment failed. Please try again."
      )
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
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
              {availableSemesters.map((sem: any) => (
                <SelectItem key={sem._id} value={sem._id}>
                  {sem.name} {sem.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSemester && (
            <div className="mt-4">
              <Button onClick={bulkEnroll}>Enroll in All Courses</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
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

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {enrolledCourses.length === 0 ? (
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
                    <TableHead>{course.name}</TableHead>
                    <TableHead>{course.code}</TableHead>
                    <TableHead>{course.credits}</TableHead>
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
