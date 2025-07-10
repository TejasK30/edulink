"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/api"
import JobListing, { JobPosting } from "@/components/JobListing"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"

const AdminJobsList = () => {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      toast.error("User not logged in")
      router.push("/login")
    }
  }, [user, router])

  const {
    data: jobs,
    isLoading,
    error,
  } = useQuery<JobPosting[], Error>({
    enabled: !!user?.collegeId,
    queryKey: ["jobs", user?.collegeId],
    queryFn: async () => {
      const res = await api.get(`/admin/jobs/${user?.collegeId}`)
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading jobs...</span>
      </div>
    )
  }

  if (error || !jobs) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Job Listings</h1>
        <p className="text-destructive">Failed to load job listings.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Job Listings</h1>
      <JobListing jobs={jobs} role="student" />
    </div>
  )
}

export default AdminJobsList
