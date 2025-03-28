"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface AttendanceRecord {
  _id: string
  date: string
  courseId: { name: string; code: string }
  status: "present" | "absent"
}

const StudentAttendancePage = () => {
  // Initialize as an array of AttendanceRecord
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true)
      setError(null)
      const studentId = localStorage.getItem("studentId")
      if (!studentId) {
        router.push("/student/login")
        return
      }
      try {
        const response = await fetch("/api/student/attendance", {
          headers: {
            "x-student-id": studentId,
          },
        })
        if (response.ok) {
          const data: AttendanceRecord[] = await response.json()
          setAttendanceRecords(data)
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch attendance.")
          toast({
            title: errorData.message || "Fetch Error",
            variant: "destructive",
          })
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error"
        setError("Error fetching attendance: " + errorMessage)
        toast({
          title: "Error fetching attendance.",
          description: errorMessage,
          variant: "destructive",
        })
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [router, toast])

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Loading attendance...
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

export default StudentAttendancePage
