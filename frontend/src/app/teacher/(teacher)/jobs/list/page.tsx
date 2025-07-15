"use client"

import JobListing, { JobPosting } from "@/components/JobListing"
import api from "@/lib/api"
import { useAuth } from "@/lib/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const TeacherJobsListPage = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [hasMounted, setHasMounted] = useState(false)
  const { user: currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (hasMounted && !currentUser) {
      toast.error("User not logged in")
      router.push("/login")
    }
  }, [hasMounted, currentUser, router])

  useEffect(() => {
    const fetchJobs = async () => {
      if (currentUser?.collegeId) {
        try {
          const response = await api.get(
            `/student/jobs/${currentUser.collegeId}`
          )
          setJobs(response.data)
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message || "Failed to load job postings."
          )
        }
      } else if (hasMounted && currentUser) {
        console.warn(
          "currentUser exists but collegeid is undefined:",
          currentUser
        )
        toast.error("User college information is missing.")
      }
    }

    if (currentUser) {
      fetchJobs()
    }
  }, [currentUser, hasMounted])

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Job Listings</h1>
      <JobListing jobs={jobs} role="student" />
    </div>
  )
}

export default TeacherJobsListPage
