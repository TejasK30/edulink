"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface AssignmentDetails {
  _id: string
  title: string
  name: string
  questions: string[]
  dueDate: string
  createdAt: string
  updatedAt: string
  collegeId: string
  departmentId: string
  courseId: string
  teacherId: string
}

export default function AssignmentDetailsPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>
}) {
  const resolvedParams = React.use(params)
  const { assignmentId } = resolvedParams

  const router = useRouter()
  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      if (!assignmentId || typeof assignmentId !== "string") {
        setError("Invalid Assignment ID")
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<AssignmentDetails>(
          `/teacher/assignments/${assignmentId}`
        )
        if (response.status === 200) {
          setAssignment(response.data)
        } else if (response.status === 404) {
          setError("Assignment not found")
        } else {
          setError("Failed to fetch assignment details")
        }
      } catch (error: any) {
        setError(error.message || "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAssignmentDetails()
  }, [assignmentId])

  const safeFormat = (dateStr: string) => {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? "Invalid date" : format(date, "PPP HH:mm")
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Assignments
        </Button>
      </div>

      <div>
        {loading && <p>Loading assignment details...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && assignment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight">
                {assignment.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{assignment.name}</p>
              <p>Due Date: {safeFormat(assignment.dueDate)}</p>
              <p>Created At: {safeFormat(assignment.createdAt)}</p>
              <p>Updated At: {safeFormat(assignment.updatedAt)}</p>
              <h3 className="font-semibold mt-4">Questions:</h3>
              {assignment.questions && Array.isArray(assignment.questions) ? (
                <ol className="list-decimal pl-5 space-y-2">
                  {assignment.questions.map((question, index) => (
                    <li key={`question-${index}`}>{question}</li>
                  ))}
                </ol>
              ) : (
                <p>No questions available for this assignment.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
