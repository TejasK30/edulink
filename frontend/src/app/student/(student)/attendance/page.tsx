"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import api from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface AttendanceRecord {
  _id: string
  date: string
  courseId: { name: string; code: string }
  status: "present" | "absent"
}

export default function StudentAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { currentUser } = useAppStore()

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true)
      setError(null)

      if (!currentUser) return

      try {
        const response = await api.get(`/student/attendance/${currentUser._id}`)
        setAttendanceRecords(response.data)
      } catch (err: any) {
        console.error("Error fetching attendance:", err)
        setError("Failed to load attendance. Please try again later.")
        toast("Failed to load attendance. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [currentUser, router])

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Skeleton className="h-10 w-10 mx-auto" />
        <p>Loading attendance...</p>
      </div>
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
      <h1 className="text-3xl font-bold mb-6 text-center">Your Attendance</h1>
      {attendanceRecords.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Attendance records for your courses</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
                  <TableCell>
                    {record.courseId?.name} ({record.courseId?.code})
                  </TableCell>
                  <TableCell
                    className={
                      record.status === "present"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {record.status.toUpperCase()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-gray-500 text-center">
          No attendance records found.
        </p>
      )}
    </div>
  )
}
