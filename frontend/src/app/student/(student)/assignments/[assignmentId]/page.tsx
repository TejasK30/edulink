"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

interface AssignmentDetail {
  _id: string
  title: string
  name: string
  dueDate: string
  questions: string[]
  teacherId: { _id: string; name: string }
  createdAt: string
  updatedAt: string
}

export default function AssignmentDetailPage() {
  const router = useRouter()
  const { assignmentId } = useParams() as { assignmentId: string }
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!assignmentId) {
      setError("Invalid assignment ID")
      setIsLoading(false)
      return
    }
    const fetchAssignmentDetails = async () => {
      setIsLoading(true)
      try {
        const response = await api.get<AssignmentDetail>(
          `/assignments/${assignmentId}`
        )
        setAssignment(response.data)
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load assignment details"
        )
        toast("Failed to load assignment details")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAssignmentDetails()
  }, [assignmentId])

  const safeFormat = (dateStr: string) => {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? "Invalid date" : format(date, "PPP, p")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Skeleton className="w-full h-64" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : assignment ? (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {assignment.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium">
              Assignment Name: {assignment.name}
            </p>
            <p>Due Date: {safeFormat(assignment.dueDate)}</p>
            <p>Created At: {safeFormat(assignment.createdAt)}</p>
            <p>Updated At: {safeFormat(assignment.updatedAt)}</p>
            <div>
              <h3 className="text-xl font-semibold mb-2">Questions</h3>
              <ol className="list-decimal pl-6 space-y-2">
                {assignment.questions.map((q, index) => (
                  <li key={index} className="text-base">
                    {q}
                  </li>
                ))}
              </ol>
            </div>
            <p className="text-sm text-muted-foreground">
              Created by: {assignment.teacherId.name}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
