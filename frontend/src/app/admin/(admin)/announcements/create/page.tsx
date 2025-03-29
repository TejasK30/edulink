"use client"

import { Button } from "@/components/ui/button"
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
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Department {
  _id: string
  name: string
}

const CreateAnnouncementPage = () => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [departments, setDepartments] = useState<Department[]>([])
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchDepartments = async () => {
      const adminId = localStorage.getItem("adminId")
      if (!adminId) {
        router.push("/admin/login")
        return
      }
      const collegeId = localStorage.getItem("collegeId")
      if (!collegeId) {
        toast("College ID not found.")
        return
      }
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/departments`,
          {
            headers: {
              "x-admin-id": adminId,
            },
          }
        )
        if (response.ok) {
          const data = await response.json()
          setDepartments(data)
        } else {
          toast("Failed to fetch departments.")
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error"
        toast("Error fetching departments. " + errorMessage)
        console.error(err)
      }
    }

    fetchDepartments()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    const collegeId = localStorage.getItem("collegeId")
    const isAdmin = localStorage.getItem("adminId")

    if (!collegeId) {
      toast("College ID not found.")
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isAdmin && { "x-admin-id": isAdmin }),
          ...(!isAdmin && {
            "x-teacher-id": localStorage.getItem("teacherId") || "",
          }),
        },
        body: JSON.stringify({
          collegeId,
          title,
          content,
          departmentId: departmentId || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast("Announcement created successfully!")
        router.push("/admin/announcements")
      } else {
        toast("Failed to create announcement. " + data.message)
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred"
      toast("Error creating announcement. " + errorMessage)
      console.error(err)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Create New Announcement
      </h1>
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      {successMessage && (
        <div className="text-green-500 mb-4 text-center">{successMessage}</div>
      )}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter announcement title"
          />
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Enter announcement content"
            rows={5}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="departmentId">
            Department (Optional - for department-specific announcements)
          </Label>
          <Select onValueChange={setDepartmentId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a department (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">College-wide</SelectItem>
              {departments.map((dept: Department) => (
                <SelectItem key={dept._id} value={dept._id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">
          Create Announcement
        </Button>
      </form>
    </div>
  )
}

export default CreateAnnouncementPage
