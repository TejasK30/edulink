"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Job {
  _id: string
  companyName: string
  applyLink: string
  jobDescription: string
  createdAt: string
}

const StudentJobsPage = () => {
  // Initialize jobs as an array of Job objects.
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      const studentId = localStorage.getItem("studentId")
      if (!studentId) {
        router.push("/student/login")
        return
      }
      try {
        const response = await fetch("/api/jobs", {
          headers: {
            "x-student-id": studentId,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setJobs(data)
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch jobs.")
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error"
        setError("Error fetching jobs: " + errorMessage)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [router, toast])

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">Loading jobs...</div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Available Job Opportunities
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.length > 0 ? (
          jobs.map((job: Job) => (
            <Card key={job._id}>
              <CardHeader>
                <CardTitle>{job.companyName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  {job.jobDescription.substring(0, 150)}...
                </p>
                <Button asChild>
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply Now
                  </a>
                </Button>
                <p className="text-xs text-gray-500">
                  Posted on: {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            No job opportunities available at the moment.
          </p>
        )}
      </div>
    </div>
  )
}

export default StudentJobsPage
