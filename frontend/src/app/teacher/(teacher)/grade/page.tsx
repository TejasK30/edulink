"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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

interface Student {
  _id: string
  name: string
  email: string
}

interface GradeEntry {
  studentId: string
  gradeValue: number
  notes?: string
}

export default function TeacherGradingPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const teacherId = currentUser?.id || ""
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [gradeType, setGradeType] = useState<"assignment" | "exam">(
    "assignment"
  )
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<string>("")
  const [students, setStudents] = useState<Student[]>([])
  const [gradeEntries, setGradeEntries] = useState<Record<string, GradeEntry>>(
    {}
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get(
          `/assignments/courses/teacher/${teacherId}`
        )
        setCourses(response.data)
      } catch (error: any) {
        toast("Failed to load your courses. Please try again.")
      }
    }
    if (teacherId) {
      fetchCourses()
    }
  }, [teacherId])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get(
          `/teacher/courses/${selectedCourse}/enrolled-students`
        )
        setStudents(response.data)
      } catch (error: any) {
        toast("Failed to load enrolled students. Please try again.")
      }
    }
    if (selectedCourse) {
      fetchStudents()
    }
  }, [selectedCourse])

  useEffect(() => {
    const fetchAssignments = async () => {
      if (gradeType !== "assignment" || !selectedCourse) return
      try {
        const response = await api.get(`/assignments/course/${selectedCourse}`)
        setAssignments(response.data)
      } catch (error: any) {
        toast("Failed to load assignments. Please try again.")
      }
    }
    fetchAssignments()
  }, [gradeType, selectedCourse])

  const handleGradeChange = (studentId: string, value: number) => {
    setGradeEntries((prev) => ({
      ...prev,
      [studentId]: { studentId, gradeValue: value },
    }))
  }

  const handleNotesChange = (studentId: string, value: string) => {
    setGradeEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], studentId, notes: value },
    }))
  }

  const handleSubmitGrades = async () => {
    if (!selectedCourse) {
      toast("Please select a course.")
      return
    }
    if (gradeType === "assignment" && !selectedAssignment) {
      toast("Please select an assignment for grading.")
      return
    }
    if (Object.keys(gradeEntries).length === 0) {
      toast("Please enter at least one grade.")
      return
    }
    setIsSubmitting(true)
    try {
      const payload = {
        teacherId,
        courseId: selectedCourse,
        gradeType,
        assignmentId:
          gradeType === "assignment" ? selectedAssignment : undefined,
        grades: Object.values(gradeEntries),
      }
      const response = await api.post(
        `/teacher/grade-students/${teacherId}`,
        payload
      )
      if (response.data.success) {
        toast("Grades assigned successfully.")
        setGradeEntries({})
        router.push("/teacher/dashboard")
      } else {
        toast("Failed to assign grades.")
      }
    } catch (error: any) {
      toast("Error assigning grades: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Assign Grades</h1>

      <div>
        <label className="block text-sm font-medium mb-2">Select Course</label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="-- Select Course --" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.code} - {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Select Grade Type
        </label>
        <Select
          value={gradeType}
          onValueChange={(val) => setGradeType(val as "assignment" | "exam")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="-- Select Grade Type --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assignment">Assignment</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {gradeType === "assignment" && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Assignment
          </label>
          <Select
            value={selectedAssignment}
            onValueChange={setSelectedAssignment}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- Select Assignment --" />
            </SelectTrigger>
            <SelectContent>
              {assignments.map((assignment) => (
                <SelectItem key={assignment._id} value={assignment._id}>
                  {assignment.title} - {assignment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Enrolled Students</h2>
        {students.length === 0 ? (
          <p>No students enrolled in this course.</p>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student._id}
                className="border p-4 rounded flex flex-col gap-2"
              >
                <p className="font-medium">{student.name}</p>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Grade (max 10):</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    className="w-32"
                    onChange={(e) =>
                      handleGradeChange(student._id, Number(e.target.value))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Notes:</label>
                  <Input
                    type="text"
                    className="w-full"
                    onChange={(e) =>
                      handleNotesChange(student._id, e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmitGrades} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Grades"}
        </Button>
      </div>
    </div>
  )
}
