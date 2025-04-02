"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import api from "@/lib/api"
import { useAppStore } from "@/lib/store"

export type JobPosting = {
  collegeId: string
  jobTitle: string
  companyName: string
  applyLink: string
  jobDescription: string
  postedBy: string
  location?: string
  jobType?: "Full-time" | "Part-time" | "Internship" | "Contract"
  deadline?: string
}

type FormValues = Omit<JobPosting, "collegeId" | "postedBy">

const CreateJobPage = () => {
  const router = useRouter()
  const { currentUser } = useAppStore()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (hasMounted && !currentUser) {
      toast.error("User not logged in")
      router.push("/login")
    }
  }, [hasMounted, currentUser, router])

  const form = useForm<FormValues>({
    defaultValues: {
      jobTitle: "",
      companyName: "",
      applyLink: "",
      jobDescription: "",
      location: "",
      jobType: "Full-time",
      deadline: "",
    },
  })

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!currentUser) {
      toast.error("Authentication Error: User information not found.")
      return
    }
    if (currentUser.role !== "admin" && currentUser.role !== "teacher") {
      toast.error(
        "Unauthorized: Your role is not authorized to create job postings."
      )
      return
    }
    let url = ""
    if (currentUser.role === "admin") {
      url = `/admin/job-postings/${currentUser._id}`
    } else if (currentUser.role === "teacher") {
      url = `/teacher/job-postings/${currentUser._id}`
    }
    const payload: JobPosting = {
      ...data,
      collegeId: currentUser.collegeid,
      postedBy: currentUser._id,
    }
    try {
      await api.post(url, payload)
      toast.success("Job posted successfully!")
      form.reset()
      router.push("/teacher/jobs/list")
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to post job. Please try again."
      )
    }
  }

  if (!hasMounted) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Post a New Job</CardTitle>
          <CardDescription className="text-gray-600">
            Fill out the form below to create your job posting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  rules={{ required: "Job title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  rules={{ required: "Company name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="applyLink"
                rules={{ required: "Application link is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apply Link</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/apply"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobDescription"
                rules={{ required: "Job description is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={8}
                        placeholder="Enter a detailed job description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City, State (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Internship">
                              Internship
                            </SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                {form.formState.isSubmitting ? "Posting..." : "Post Job"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateJobPage
