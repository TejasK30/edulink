"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CollegeFeedbackSection } from "@/components/student/feedback/CollegeFeedback"
import { TeacherFeedbackSection } from "@/components/student/feedback/TeacherFeedback"
import { useFeedbackSubmission } from "@/hooks/useFeedback"
import { useAuth } from "@/lib/providers/auth-provider"
import { feedbackSchema } from "@/lib/schemas/feedback.schema"
import { cn } from "@/lib/utils"
import { ApiError, FeedbackFormValues } from "@/types/feedback.types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FieldError } from "react-hook-form"

const defaultFeedbackValues: FeedbackFormValues = {
  teacherFeedback: {
    clarity: undefined,
    expertise: undefined,
    engagement: undefined,
    punctuality: undefined,
    assessment: undefined,
    subjectContent: undefined,
    overallTeacher: undefined,
    teacherComment: "",
  },
  collegeFeedback: {
    facilities: undefined,
    campusLife: undefined,
    administration: undefined,
    academicEnvironment: undefined,
    overallCollege: undefined,
    collegeComment: "",
  },
}

export default function FeedbackPage() {
  const { user: currentUser } = useAuth()
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: defaultFeedbackValues,
    shouldUnregister: true,
  })

  const feedbackMutation = useFeedbackSubmission()

  const getError = (fieldName: string): string | null => {
    const keys = fieldName.split(".")
    let currentError: unknown = errors

    for (const key of keys) {
      if (
        !currentError ||
        typeof currentError !== "object" ||
        !(key in currentError)
      ) {
        return null
      }
      currentError = (currentError as Record<string, unknown>)[key]
    }

    return (currentError as FieldError)?.message || null
  }

  const onSubmit = async (data: FeedbackFormValues) => {
    if (!currentUser?.id) {
      setSubmitError("User not identified. Please log in again.")
      return
    }

    const teacherRatingsGiven = Object.values(data.teacherFeedback).some(
      (value) => typeof value === "number" && value > 0
    )

    if (teacherRatingsGiven && !selectedTeacherId) {
      setSubmitError(
        "Please select the teacher you are providing feedback for."
      )
      return
    }

    setSubmitError(null)
    setSubmitMessage(null)

    try {
      const result = await feedbackMutation.mutateAsync({
        userId: currentUser.id,
        payload: {
          teacherId: selectedTeacherId,
          teacherFeedback: data.teacherFeedback,
          collegeFeedback: data.collegeFeedback,
        },
      })

      setSubmitMessage(result.message || "Feedback submitted successfully!")
      reset(defaultFeedbackValues)
      setSelectedTeacherId(null)
    } catch (error) {
      const apiError = error as ApiError
      const errorMessage =
        apiError.response?.data?.details ||
        apiError.response?.data?.error ||
        apiError.message ||
        "An unexpected error occurred during submission."

      setSubmitError(errorMessage)
    }
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading user information...</p>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen p-4 md:p-6 text-foreground")}>
      <Card className="max-w-4xl mx-auto shadow-lg border border-border/40">
        <CardHeader className="text-center border-b border-border/40 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Student Feedback
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground pt-1">
            Your feedback helps us improve. Please rate on a scale of 1 (Poor)
            to 5 (Excellent).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {submitError && (
            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-center text-sm font-medium border border-destructive/30">
              {submitError}
            </div>
          )}
          {submitMessage && (
            <div className="p-3 rounded-md bg-green-500/15 text-green-700 text-center text-sm font-medium border border-green-500/30">
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <TeacherFeedbackSection
              control={control}
              getError={getError}
              selectedTeacherId={selectedTeacherId}
              setSelectedTeacherId={setSelectedTeacherId}
              collegeId={currentUser.collegeId}
              teacherRatingsGiven={Boolean(
                Object.keys(errors.teacherFeedback ?? {}).length > 0 &&
                  !selectedTeacherId
              )}
            />

            <CollegeFeedbackSection control={control} getError={getError} />

            <CardFooter className="flex justify-end border-t border-border/40 pt-6 mt-4">
              <Button
                type="submit"
                disabled={feedbackMutation.isPending || !currentUser}
                size="lg"
              >
                {feedbackMutation.isPending
                  ? "Submitting..."
                  : "Submit Feedback"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
