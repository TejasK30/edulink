"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { Loader2 } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/lib/providers/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface FeedbackAnalytics {
  totalFeedbacks: number
  averageOverallRating: number
  feedbackTypeBreakdown: Array<{
    _id: string
    count: number
    averageRating: number
  }>
  averageTeacherRating?: number
  averageCollegeRating?: number
}

export default function FeedbackAnalyticsPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/")
    }
  }, [currentUser, router])

  const {
    data: collegeAnalytics,
    error,
    isLoading,
  } = useQuery<FeedbackAnalytics, AxiosError>({
    enabled: !!currentUser && currentUser.role === "admin",
    queryKey: ["college-analytics", currentUser?.id],
    queryFn: async () => {
      const response = await api.get(
        `/feedback/analytics/admin/${currentUser?.id}`
      )
      return response.data
    },
  })

  if (isLoading && !collegeAnalytics) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!collegeAnalytics || collegeAnalytics.totalFeedbacks === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No feedback data available for your college yet.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">College Feedback Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Feedbacks</CardTitle>
            <CardDescription>Submitted for your college</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {collegeAnalytics.totalFeedbacks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Average Rating</CardTitle>
            <CardDescription>Across all feedback types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {collegeAnalytics.averageOverallRating.toFixed(2)} / 5
            </div>
          </CardContent>
        </Card>

        {collegeAnalytics.averageTeacherRating !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle>Average Teacher Rating</CardTitle>
              <CardDescription>For teachers in your college</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {collegeAnalytics.averageTeacherRating.toFixed(2)} / 5
              </div>
            </CardContent>
          </Card>
        )}

        {collegeAnalytics.averageCollegeRating !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle>Average College Rating</CardTitle>
              <CardDescription>For the college overall</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">
                {collegeAnalytics.averageCollegeRating.toFixed(2)} / 5
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {collegeAnalytics.feedbackTypeBreakdown.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Type Breakdown</CardTitle>
              <CardDescription>
                Counts and average ratings by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collegeAnalytics.feedbackTypeBreakdown.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center p-3 bg-muted rounded-md"
                  >
                    <span className="font-medium capitalize">
                      {item._id} Feedbacks:
                    </span>
                    <span>{item.count} submissions</span>
                    <span className="text-sm text-muted-foreground">
                      Avg Rating: {item.averageRating.toFixed(2)} / 5
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
