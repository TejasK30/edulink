"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"

interface Assignment {
  _id: string
  title: string
  dueDate: string
  totalMarks?: number
  submissionType: "online" | "offline"
}

const TeacherAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const courseId = searchParams.get("courseId")

  useEffect(() => {
    if (!courseId) return

    const fetchAssignments = async () => {
      setLoading(true)
      setError(null)
      const teacherId = "afksd"
      // const teacherId = localStorage.getItem("teacherId")
      // if (!teacherId) {
      //   router.push("/teacher/login")
      //   return
      // }
      try {
        const response = await fetch(
          `http://localhost:5000/api/teacher/courses/${courseId}/assignments`,
          {
            headers: {
              "x-teacher-id": teacherId,
            },
          }
        )
        if (response.ok) {
          const data = await response.json()
          setAssignments(data)
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch assignments.")
        }
      } catch (err: any) {
        setError("Error fetching assignments.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [router, courseId])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading assignments...
      </div>
    )
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    )

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Assignments for Course: {courseId}
      </h1>
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() =>
            router.push(`/teacher/assignments/create?courseId=${courseId}`)
          }
        >
          Create New Assignment
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Total Marks</TableHead>
              <TableHead>Submission Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment: Assignment) => (
              <TableRow key={assignment._id}>
                <TableCell>{assignment.title}</TableCell>
                <TableCell>
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{assignment.totalMarks ?? "N/A"}</TableCell>
                <TableCell>{assignment.submissionType}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/teacher/assignments/edit/${assignment._id}`)
                    }
                  >
                    Edit
                  </Button>
                  <Button size="sm">View Submissions</Button>
                  <Button size="sm" variant="destructive">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Button onClick={() => router.back()}>Back to Dashboard</Button>
      </div>
    </div>
  )
}

export default TeacherAssignmentsPage
