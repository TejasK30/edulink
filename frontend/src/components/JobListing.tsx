"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export type JobPosting = {
  _id: string
  jobTitle: string
  companyName: string
  applyLink: string
  jobDescription: string
  location?: string
  jobType?: "Full-time" | "Part-time" | "Internship" | "Contract"
  deadline?: string
  createdAt: string
}

interface JobListingProps {
  jobs: JobPosting[]
  role: "admin" | "teacher" | "student"
}

const JobListing = ({ jobs, role }: JobListingProps) => {
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Card key={job._id} className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{job.jobTitle}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {job.companyName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-gray-700">{job.jobDescription}</p>
            {job.location && (
              <p className="text-gray-600">
                <span className="font-medium">Location:</span> {job.location}
              </p>
            )}
            {job.jobType && (
              <p className="text-gray-600">
                <span className="font-medium">Type:</span> {job.jobType}
              </p>
            )}
            {job.deadline && (
              <p className="text-gray-600">
                <span className="font-medium">Deadline:</span>{" "}
                {new Date(job.deadline).toLocaleDateString()}
              </p>
            )}
          </CardContent>
          {role === "student" && (
            <>
              <div className="p-4">
                <Link href={job.applyLink} target="_blank" className="w-full">
                  <Button className="w-full">Apply Now</Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  )
}

export default JobListing
