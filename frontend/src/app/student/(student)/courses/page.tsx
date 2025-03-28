"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Course {
  _id: string
  name: string
  code: string
  description?: string
  credits: number
}

const StudentCoursesPage = () => {
  // Define courses as an array of Course
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCourses = async () => {
      const studentId = localStorage.getItem("studentId")
      if (!studentId) {
        router.push("/student/login")
        return
      }
      try {
        // Adjust the endpoint as needed
        const response = await fetch(
          `http://localhost:5000/api/student/courses`
        )
        if (response.ok) {
          const data = await response.json()
          // Assuming data is an array of courses
          setCourses(data)
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch courses.")
        }
      } catch (error: any) {
        setError("Error fetching courses.")
        console.error(error)
      }
    }

    fetchCourses()
  }, [router])

  const handleEnroll = async () => {
    if (!selectedCourse) {
      setError("Please select a course to enroll in.")
      return
    }
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(
        `http://localhost:5000/api/student/enroll/${selectedCourse}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include any necessary authentication headers
          },
          body: JSON.stringify({
            // You might need to send additional data (e.g., semester ID)
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setSuccessMessage(
          data.message || "Successfully enrolled in the course."
        )
        // Optionally, refresh or update the course list here.
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to enroll in the course.")
      }
    } catch (error: any) {
      setError("Error enrolling in the course.")
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Available Courses</h1>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {successMessage && (
        <div className="text-green-500 text-center mb-4">{successMessage}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {courses.map((course) => (
          <Card key={course._id}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {course.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">Code: {course.code}</p>
              {course.description && (
                <p className="text-sm text-gray-500 mb-2">
                  {course.description}
                </p>
              )}
              <p className="text-sm text-gray-500">Credits: {course.credits}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Enroll in a Course
        </h2>
        <Select onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a course to enroll" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.name} ({course.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleEnroll} className="mt-6 w-full">
          Enroll
        </Button>
      </div>
    </div>
  )
}

export default StudentCoursesPage
