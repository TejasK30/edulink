"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
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
}

export default function CreateAssignmentPage() {
  const { currentUser } = useAppStore()
  const router = useRouter()
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [title, setTitle] = useState("")
  const [assignmentName, setAssignmentName] = useState("")
  const [questions, setQuestions] = useState<string[]>(Array(6).fill(""))
  const [dueDate, setDueDate] = useState<string>("") // ISO date string
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch teacher courses only if currentUser and teacherId are available
  useEffect(() => {
    if (!currentUser || !currentUser._id) return
    const teacherId = currentUser._id
    const fetchCourses = async () => {
      try {
        const response = await api.get(
          `/assignments/courses/teacher/${teacherId}`
        )
        setTeacherCourses(response.data)
      } catch (error) {
        toast("Failed to load your courses. Please try again.")
      }
    }
    fetchCourses()
  }, [currentUser])

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = value
    setQuestions(newQuestions)
  }

  const handleSubmit = async () => {
    if (
      !selectedCourse ||
      !title ||
      !assignmentName ||
      questions.some((q) => !q) ||
      !dueDate ||
      !currentUser?._id
    ) {
      toast("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        courseId: selectedCourse,
        title,
        name: assignmentName,
        questions,
        dueDate, // should be an ISO string
      }
      const teacherId = currentUser._id
      const response = await api.post(
        `/assignments/teacher/${teacherId}`,
        payload
      )
      if (response.status === 201) {
        toast("Assignment created successfully!")
        router.push("/teacher/assignments/list")
      } else {
        toast("Failed to create assignment.")
      }
    } catch (error: any) {
      toast("Error creating assignment: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Assignment</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Course</label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {teacherCourses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.code} - {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Assignment Title
        </label>
        <Input
          placeholder="Enter assignment title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Assignment Name
        </label>
        <Input
          placeholder="Enter assignment name"
          value={assignmentName}
          onChange={(e) => setAssignmentName(e.target.value)}
        />
      </div>

      <div className="mb-4 space-y-3">
        <label className="block text-sm font-medium">Questions</label>
        {questions.map((q, index) => (
          <Textarea
            key={index}
            placeholder={`Question ${index + 1}`}
            value={q}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
            className="w-full"
          />
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Due Date</label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create Assignment"}
        </Button>
      </div>
    </div>
  )
}
