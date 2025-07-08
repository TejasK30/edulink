"use client"

import JobListing, { JobPosting } from "@/components/JobListing"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import { useQuery } from "@tanstack/react-query"

const fetchStudentJobs = async (collegeId: string): Promise<JobPosting[]> => {
  const response = await api.get<JobPosting[]>(`/student/jobs/${collegeId}`)
  return response.data
}

const StudentJobsPage = () => {
  const { user: currentUser } = useAuth()

  const {
    data: jobs = [],
    isLoading,
    isError,
  } = useQuery<JobPosting[], Error>({
    queryKey: ["studentJobs", currentUser?.collegeId],
    queryFn: () => {
      if (!currentUser?.collegeId) {
        throw new Error("College ID is missing")
      }
      return fetchStudentJobs(currentUser.collegeId)
    },
    enabled: !!currentUser?.collegeId,
  })

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Job Listings</h1>

      {isLoading ? (
        <p>Loading jobs...</p>
      ) : isError ? (
        <p className="text-red-500">Failed to load job postings.</p>
      ) : jobs.length === 0 ? (
        <p>No job postings available.</p>
      ) : (
        <JobListing jobs={jobs} role="student" />
      )}
    </div>
  )
}

export default StudentJobsPage
