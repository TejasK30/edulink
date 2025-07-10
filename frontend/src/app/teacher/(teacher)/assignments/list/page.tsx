"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import { cn } from "@/lib/utils"
import { format, isPast } from "date-fns"
import { ArrowLeft, Eye, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Assignment {
  _id: string
  title: string
  name: string
  dueDate: string
  createdAt: string
  updatedAt: string
  questions: string[]
}

const AssignmentListPage = () => {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!currentUser?.id) {
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(
          `/teacher/assignments/teacher/${currentUser.id}`
        )
        if (response.status === 200) {
          setAssignments(response.data)
        } else {
          setError("Failed to fetch assignments")
        }
      } catch (error: any) {
        setError(error.message || "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [currentUser?.id])

  const getAssignmentStatus = (dueDate: string): "Upcoming" | "Overdue" => {
    const dueDateObj = new Date(dueDate)
    return isPast(dueDateObj) ? "Overdue" : "Upcoming"
  }

  const handleViewAssignment = (assignmentId: string) => {
    router.push(`/teacher/assignments/${assignmentId}`)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button
          onClick={() => router.push("/assignments/create")}
          className="space-x-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create Assignment</span>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Assignments
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mt-1 mb-6">
          Manage and view all your created assignments here.
        </p>

        {loading && <p>Loading assignments...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && assignments.length === 0 && (
          <p>No assignments created yet.</p>
        )}

        {!loading && !error && assignments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <Card key={assignment._id}>
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {assignment.name}
                  </p>
                  <p className="text-sm">
                    Due Date:{" "}
                    {format(new Date(assignment.dueDate), "PPP HH:mm")}
                  </p>
                  <p className="text-sm font-semibold">
                    Status:{" "}
                    <span
                      className={cn({
                        "text-green-500":
                          getAssignmentStatus(assignment.dueDate) ===
                          "Upcoming",
                        "text-red-500":
                          getAssignmentStatus(assignment.dueDate) === "Overdue",
                      })}
                    >
                      {getAssignmentStatus(assignment.dueDate)}
                    </span>
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleViewAssignment(assignment._id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignmentListPage
