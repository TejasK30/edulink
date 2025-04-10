"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import api from "@/lib/api"

interface Teacher {
  _id: string
  name: string
}

const feedbackSchema = z.object({
  teacherFeedback: z.object({
    clarity: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    expertise: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    engagement: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    punctuality: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    assessment: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    subjectContent: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    overallTeacher: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    teacherComment: z.string().trim().optional(),
  }),
  collegeFeedback: z.object({
    facilities: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    campusLife: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    administration: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    academicEnvironment: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    overallCollege: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5"),
    collegeComment: z.string().trim().optional(),
  }),
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

export default function FeedbackPage() {
  const { currentUser } = useAppStore()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null
  )
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
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
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!currentUser?.collegeid) return

      setIsLoadingTeachers(true)
      try {
        const response = await api.get(
          `/users?role=teacher&collegeId=${currentUser.collegeid}`
        )
        setTeachers(response.data.users || [])
      } catch (error: any) {
        console.error("Error fetching teachers:", error)
      } finally {
        setIsLoadingTeachers(false)
      }
    }

    if (currentUser) {
      fetchTeachers()
    }
  }, [currentUser])

  const onSubmit = async (data: FeedbackFormValues) => {
    if (!currentUser?._id) {
      setSubmitError("User not identified. Please log in again.")
      return
    }

    const teacherRatingsGivenCheck =
      Object.values(data.teacherFeedback).filter(
        (v) => typeof v === "number" && v > 0
      ).length > 0
    if (teacherRatingsGivenCheck && !selectedTeacherId) {
      setSubmitError(
        "Please select the teacher you are providing feedback for."
      )
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitMessage(null)

    const payload = {
      teacherId: selectedTeacherId || null,
      teacherFeedback: data.teacherFeedback,
      collegeFeedback: data.collegeFeedback,
    }

    console.log("Submitting payload:", payload)

    try {
      const response = await api.post(`/feedback/${currentUser._id}`, payload)

      console.log("API Success Response:", response.data)
      setSubmitMessage(
        response.data.message || "Feedback submitted successfully!"
      )
      reset()
      setSelectedTeacherId(null)
    } catch (err: any) {
      console.error("API Submit Error:", err)

      let errorMessage = "An unexpected error occurred during submission."
      if (err.response && err.response.data) {
        errorMessage =
          err.response.data.details || err.response.data.error || errorMessage
      } else if (err.request) {
        errorMessage =
          "Could not connect to the server. Please try again later."
      } else {
        errorMessage = err.message || errorMessage
      }
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getError = (fieldName: string) => {
    const keys = fieldName.split(".")
    let currentError: any = errors
    try {
      for (const key of keys) {
        if (!currentError || !currentError[key]) return null
        currentError = currentError[key]
      }
      return currentError?.message
    } catch {
      return null
    }
  }

  const teacherRatingsGiven =
    !!errors?.teacherFeedback &&
    Object.keys(errors.teacherFeedback).length > 0 &&
    !selectedTeacherId

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
            <div className="space-y-4 p-4 border border-border/40 rounded-md">
              <h2 className="text-xl font-semibold mb-3 border-b border-border/40 pb-2">
                Teacher & Subject Feedback
              </h2>

              <div className="grid gap-1.5">
                <Label htmlFor="teacherSelect">Select Teacher</Label>
                <Select
                  value={selectedTeacherId ?? ""}
                  onValueChange={(value) => setSelectedTeacherId(value || null)}
                  disabled={isLoadingTeachers || teachers.length === 0}
                >
                  <SelectTrigger
                    id="teacherSelect"
                    className={cn(
                      !selectedTeacherId &&
                        teacherRatingsGiven &&
                        "border-destructive"
                    )}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingTeachers
                          ? "Loading teachers..."
                          : "Select the teacher"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <SelectItem key={teacher._id} value={teacher._id}>
                          {teacher.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-teachers" disabled>
                        {isLoadingTeachers ? "Loading..." : "No teachers found"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!selectedTeacherId && teacherRatingsGiven && (
                  <p className="text-xs text-destructive">
                    Please select a teacher for this feedback.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="clarity">Clarity & Communication</Label>
                  <Controller
                    name="teacherFeedback.clarity"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="clarity"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("teacherFeedback.clarity") &&
                            "border-destructive"
                        )}
                      />
                    )}
                  />
                  {getError("teacherFeedback.clarity") && (
                    <p className="text-xs text-destructive">
                      {getError("teacherFeedback.clarity")}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="expertise">Knowledge & Expertise</Label>
                  <Controller
                    name="teacherFeedback.expertise"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="expertise"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("teacherFeedback.expertise") &&
                            "border-destructive"
                        )}
                      />
                    )}
                  />
                  {getError("teacherFeedback.expertise") && (
                    <p className="text-xs text-destructive">
                      {getError("teacherFeedback.expertise")}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="engagement">Engagement & Interaction</Label>
                  <Controller
                    name="teacherFeedback.engagement"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="engagement"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("teacherFeedback.engagement") &&
                            "border-destructive"
                        )}
                      />
                    )}
                  />
                  {getError("teacherFeedback.engagement") && (
                    <p className="text-xs text-destructive">
                      {getError("teacherFeedback.engagement")}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="punctuality">
                    Punctuality & Organization
                  </Label>
                  <Controller
                    name="teacherFeedback.punctuality"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="punctuality"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("teacherFeedback.punctuality") &&
                            "border-destructive"
                        )}
                      />
                    )}
                  />
                  {getError("teacherFeedback.punctuality") && (
                    <p className="text-xs text-destructive">
                      {getError("teacherFeedback.punctuality")}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="assessment">
                    Assessment & Feedback Quality
                  </Label>
                  <Controller
                    name="teacherFeedback.assessment"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="assessment"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("teacherFeedback.assessment") &&
                            "border-destructive"
                        )}
                      />
                    )}
                  />
                  {getError("teacherFeedback.assessment") && (
                    <p className="text-xs text-destructive">
                      {getError("teacherFeedback.assessment")}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="subjectContent">
                    Subject Content Relevance
                  </Label>
                  <Controller
                    name="teacherFeedback.subjectContent"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="subjectContent"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("teacherFeedback.subjectContent") &&
                            "border-destructive"
                        )}
                      />
                    )}
                  />
                  {getError("teacherFeedback.subjectContent") && (
                    <p className="text-xs text-destructive">
                      {getError("teacherFeedback.subjectContent")}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5 md:col-span-2">
                  <Label htmlFor="overallTeacher" className="font-medium">
                    Overall Teacher Rating
                  </Label>
                  <Controller
                    name="teacherFeedback.overallTeacher"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="overallTeacher"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("teacherFeedback.overallTeacher") &&
                            "border-destructive",
                          "font-medium"
                        )}
                      />
                    )}
                  />
                  {getError("teacherFeedback.overallTeacher") && (
                    <p className="text-xs text-destructive">
                      {getError("teacherFeedback.overallTeacher")}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-1.5">
                <Label htmlFor="teacherComment">
                  Comments about Teacher/Subject (Optional)
                </Label>
                <Controller
                  name="teacherFeedback.teacherComment"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="teacherComment"
                      placeholder="Provide specific examples or suggestions..."
                      rows={3}
                      {...field}
                    />
                  )}
                />
                {getError("teacherFeedback.teacherComment") && (
                  <p className="text-xs text-destructive">
                    {getError("teacherFeedback.teacherComment")}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 p-4 border border-border/40 rounded-md">
              <h2 className="text-xl font-semibold mb-3 border-b border-border/40 pb-2">
                College/Institution Feedback
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="facilities">
                    Facilities & Infrastructure
                  </Label>
                  <Controller
                    name="collegeFeedback.facilities"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="facilities"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("collegeFeedback.facilities") &&
                            "border-destructive"
                        )}
                      />
                    )}
                  />
                  {getError("collegeFeedback.facilities") && (
                    <p className="text-xs text-destructive">
                      {getError("collegeFeedback.facilities")}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="campusLife">
                    Campus Life & Extracurriculars
                  </Label>
                  <Controller
                    name="collegeFeedback.campusLife"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="campusLife"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("collegeFeedback.campusLife") &&
                            "border-destructive"
                        )}
                      />
                    )}
                  />
                  {getError("collegeFeedback.campusLife") && (
                    <p className="text-xs text-destructive">
                      {getError("collegeFeedback.campusLife")}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="administration">
                    Administration & Support Services
                  </Label>
                  <Controller
                    name="collegeFeedback.administration"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="administration"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("collegeFeedback.administration") &&
                            "border-destructive"
                        )}
                      />
                    )}
                  />
                  {getError("collegeFeedback.administration") && (
                    <p className="text-xs text-destructive">
                      {getError("collegeFeedback.administration")}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="academicEnvironment">
                    Academic Environment & Resources
                  </Label>
                  <Controller
                    name="collegeFeedback.academicEnvironment"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="academicEnvironment"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("collegeFeedback.academicEnvironment") &&
                            "border-destructive"
                        )}
                      />
                    )}
                  />
                  {getError("collegeFeedback.academicEnvironment") && (
                    <p className="text-xs text-destructive">
                      {getError("collegeFeedback.academicEnvironment")}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5 md:col-span-2">
                  <Label htmlFor="overallCollege" className="font-medium">
                    Overall College Rating
                  </Label>
                  <Controller
                    name="collegeFeedback.overallCollege"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        id="overallCollege"
                        placeholder="1-5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || undefined)
                        }
                        className={cn(
                          getError("collegeFeedback.overallCollege") &&
                            "border-destructive",
                          "font-medium"
                        )}
                      />
                    )}
                  />
                  {getError("collegeFeedback.overallCollege") && (
                    <p className="text-xs text-destructive">
                      {getError("collegeFeedback.overallCollege")}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-1.5">
                <Label htmlFor="collegeComment">
                  Comments about College/Institution (Optional)
                </Label>
                <Controller
                  name="collegeFeedback.collegeComment"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="collegeComment"
                      placeholder="Share suggestions for improvement or positive experiences..."
                      rows={3}
                      {...field}
                    />
                  )}
                />
                {getError("collegeFeedback.collegeComment") && (
                  <p className="text-xs text-destructive">
                    {getError("collegeFeedback.collegeComment")}
                  </p>
                )}
              </div>
            </div>

            <CardFooter className="flex justify-end border-t border-border/40 pt-6 mt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !currentUser}
                size="lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
