"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "sonner"
import JobListing, { JobPosting } from "@/components/JobListing"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"

const AdminJobsList = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [hasMounted, setHasMounted] = useState(false)
  const { currentUser } = useAppStore()
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
      if (currentUser?.collegeid) {
        try {
          const response = await api.get(
            `/student/jobs/${currentUser.collegeid}`
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

export default AdminJobsList
