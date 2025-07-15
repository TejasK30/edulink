"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Department, Course } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuth } from "@/lib/providers/auth-provider"

export default function AssignCoursePage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("")
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { user: currentUser } = useAuth()

  useEffect(() => {
    console.log("Current user:", currentUser)
  }, [currentUser])

  const teacherId = currentUser?.id || localStorage.getItem("teacherId")

  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true)
      try {
        const response = await api.get(`/teacher/${teacherId}/departments`)
        setDepartments(response.data)
      } catch (error) {
        toast("Error \nFailed to load departments. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    if (teacherId) fetchDepartments()
  }, [teacherId])

  const handleDepartmentChange = async (departmentId: string) => {
    setSelectedDepartmentId(departmentId)
    setSelectedCourseId("")
    setCourses([])

    if (!departmentId) return

    setIsLoading(true)
    try {
      const response = await api.get(
        `/teacher/departments/${departmentId}/courses`
      )
      setCourses(response.data)
    } catch (error) {
      toast("Error \nFailed to load courses. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCourseId) {
      toast("Error \nPlease select a course to teach.")
      return
    }

    setIsSubmitting(true)
    try {
      await api.post(`/teacher/assign-course/${teacherId}`, {
        courseId: selectedCourseId,
      })

      toast("Success: You've been assigned to the course successfully.")
      router.push("/teacher/dashboard")
    } catch (error) {
      toast("Error \nFailed to assign course. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Assign Course to Teach
      </h1>

      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Select Your Course</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a department and course you would like to teach
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium">
              Department
            </label>
            <Select
              value={selectedDepartmentId}
              onValueChange={handleDepartmentChange}
              disabled={isLoading || departments.length === 0}
            >
              <SelectTrigger id="department" className="w-full">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department._id} value={department._id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="course" className="text-sm font-medium">
              Course
            </label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              disabled={
                isLoading || !selectedDepartmentId || courses.length === 0
              }
            >
              <SelectTrigger id="course" className="w-full">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedDepartmentId && courses.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground mt-2">
                No available courses in this department.
              </p>
            )}
          </div>

          {selectedCourseId && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Course Details</h3>
              {courses
                .filter((course) => course._id === selectedCourseId)
                .map((course) => (
                  <div key={course._id} className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Code:</span> {course.code}
                    </p>
                    <p>
                      <span className="font-medium">Name:</span> {course.name}
                    </p>
                    <p>
                      <span className="font-medium">Credits:</span>{" "}
                      {course.credits}
                    </p>
                    {course.description && (
                      <p>
                        <span className="font-medium">Description:</span>{" "}
                        {course.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isSubmitting || !selectedCourseId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Me To This Course"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
