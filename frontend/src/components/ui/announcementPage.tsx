"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { toast } from "sonner"

export interface Announcement {
  _id: string
  title: string
  content: string
  createdAt: string
  departmentId?: { _id: string; name: string }
}

interface AnnouncementsTableProps {
  announcements: Announcement[]
  onEdit: (announcement: Announcement) => void
  onDelete: (announcement: Announcement) => void
}

const AnnouncementsTable = ({
  announcements,
  onEdit,
  onDelete,
}: AnnouncementsTableProps) => {
  return (
    <Table className="min-w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Content</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {announcements.map((announcement: Announcement) => (
          <TableRow key={announcement._id}>
            <TableCell>{announcement.title}</TableCell>
            <TableCell>{announcement.content.substring(0, 50)}...</TableCell>
            <TableCell>
              {announcement.departmentId?.name || "College-wide"}
            </TableCell>
            <TableCell>
              {new Date(announcement.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="space-x-2">
              <Button size="sm" onClick={() => onEdit(announcement)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(announcement)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

interface AnnouncementsPageProps {
  role: "admin" | "teacher"
}

const AnnouncementsPage = ({ role }: AnnouncementsPageProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true)
      setError(null)
      const userId =
        role === "admin"
          ? localStorage.getItem("adminId")
          : localStorage.getItem("teacherId")
      if (!userId) {
        router.push(role === "admin" ? "/admin/login" : "/teacher/login")
        return
      }
      try {
        const response = await fetch("/api/announcements", {
          headers: {
            ...(role === "admin" && { "x-admin-id": userId }),
            ...(role === "teacher" && { "x-teacher-id": userId }),
          },
        })
        if (response.ok) {
          const data = await response.json()
          setAnnouncements(data)
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch announcements.")
          toast("Fetch error")
        }
      } catch (err: unknown) {
        setError("Error fetching announcements.")
        toast("Error fetching announcements.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [router, role])

  const handleEdit = (announcement: Announcement) => {
    router.push(`/${role}/announcements/edit/${announcement._id}`)
  }

  const handleDelete = (announcement: Announcement) => {
    console.log("Delete", announcement)
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading announcements...
      </div>
    )
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    )

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Manage Announcements
      </h1>
      <Button
        onClick={() => router.push(`/${role}/announcements/create`)}
        className="mb-4"
      >
        Add New Announcement
      </Button>
      <div className="mt-4 overflow-x-auto">
        <AnnouncementsTable
          announcements={announcements}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <div className="mt-4">
        <Button onClick={() => router.back()}>Back to Dashboard</Button>
      </div>
    </div>
  )
}

export default AnnouncementsPage
