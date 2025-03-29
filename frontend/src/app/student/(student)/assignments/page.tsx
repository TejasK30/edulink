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
import { useAppStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

interface Course {
  _id: string
  name: string
  code: string
}

interface Assignment {
  _id: string
  title: string
  name: string
  dueDate: string
  teacherId: { _id: string; name: string }
}

export default function StudentAssignmentListPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true)
  const [loadingAssignments, setLoadingAssignments] = useState<boolean>(false)

  const { currentUser } = useAppStore()

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await api.get(
          `/student/${currentUser?._id}/enrolled-courses`
        )
        // Extract the courses array from response.data.courses
        if (response.data && Array.isArray(response.data.courses)) {
          setEnrolledCourses(response.data.courses as Course[])
        } else {
          console.error(
            "Error: Enrolled courses data is not in the expected format:",
            response.data
          )
          toast("Failed to load enrolled courses. Please try again.")
          setEnrolledCourses([]) // Set to empty array to avoid errors
        }
      } catch (error: any) {
        console.error("Error fetching enrolled courses:", error)
        toast("Failed to load enrolled courses. Please try again.")
        setEnrolledCourses([]) // Set to empty array on error
      } finally {
        setLoadingCourses(false)
      }
    }
    if (currentUser?._id) {
      fetchEnrolledCourses()
    }
  }, [currentUser?._id])

  // Fetch assignments for selected course
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedCourse) return
      setLoadingAssignments(true)
      try {
        // Updated endpoint using route parameter
        console.log(selectedCourse)
        const response = await api.get(`/assignments/course/${selectedCourse}`)
        console.log(response.data)
        if (Array.isArray(response.data)) {
          setAssignments(response.data as Assignment[])
        } else {
          console.error(
            "Error: Assignments data is not an array:",
            response.data
          )
          toast("Failed to load assignments. Please try again.")
          setAssignments([]) // Set to empty array to avoid errors
        }
      } catch (error: any) {
        console.error("Error fetching assignments:", error)
        toast("Failed to load assignments. Please try again.")
        setAssignments([]) // Set to empty array on error
      } finally {
        setLoadingAssignments(false)
      }
    }
    fetchAssignments()
  }, [selectedCourse])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Assignments</h1>

      {/* Course Dropdown using ShadCN UI components */}
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
                  {course.code} - {course.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Assignments List */}
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
          {assignments.map((assignment: Assignment) => (
            <Card key={assignment._id} className="p-4">
              <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {" "}
                <p className="text-sm">{assignment.name}</p>
                <p className="text-sm">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  By: {assignment.teacherId.name}
                </p>
                {/* View Button */}
                <Link
                  href={`/student/assignments/${assignment._id}`}
                  className="w-fit"
                >
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
