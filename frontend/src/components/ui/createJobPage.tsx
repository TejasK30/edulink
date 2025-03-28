"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const CreateJobPage = () => {
  const [companyName, setCompanyName] = useState("")
  const [applyLink, setApplyLink] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const collegeId = localStorage.getItem("collegeId") // Assuming collegeId is stored

    if (!collegeId) {
      toast({ title: "College ID not found.", variant: "destructive" })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("adminId") && {
            "x-admin-id": localStorage.getItem("adminId") || "",
          }),
          ...(localStorage.getItem("teacherId") && {
            "x-teacher-id": localStorage.getItem("teacherId") || "",
          }),
        },
        body: JSON.stringify({
          companyName,
          applyLink,
          jobDescription,
          collegeId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Job posted successfully!" })
        // Redirect based on role
        router.push(
          localStorage.getItem("adminId") ? "/admin/jobs" : "/teacher/jobs"
        )
      } else {
        toast({
          title: "Failed to post job.",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred"
      toast({
        title: "Error posting job.",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Post a New Job</h1>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            placeholder="Enter company name"
          />
        </div>
        <div>
          <Label htmlFor="applyLink">Apply Link</Label>
          <Input
            type="url"
            id="applyLink"
            value={applyLink}
            onChange={(e) => setApplyLink(e.target.value)}
            required
            placeholder="Enter application link"
          />
        </div>
        <div>
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            required
            placeholder="Enter job description"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Posting..." : "Post Job"}
        </Button>
      </form>
    </div>
  )
}

export default CreateJobPage
