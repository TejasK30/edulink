"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { CheckIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAppStore } from "@/lib/store"

interface ICourse {
  _id: string
  name: string
  code: string
  semesterId: { _id: string; name: string; year: number }
  departmentId: { _id: string; name: string }
}

interface Student {
  _id: string
  name: string
  email: string
}

interface AttendanceRecord {
  studentId: string
  status: "present" | "absent"
}

const AttendanceMarkingComponent = () => {
  const [teacherCourses, setTeacherCourses] = useState<ICourse[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([])
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)
  const { currentUser } = useAppStore()

  console.log(currentUser)

  const teacherId = currentUser?._id

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      try {
        if (!teacherId) {
          toast.error("Teacher ID is missing")
          return
        }

        const response = await api.get(
          `/attendance/teacher/courses/${teacherId}`
        )
        setTeacherCourses(response.data)
      } catch (error) {
        toast.error("Failed to load your courses", {
          description: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    if (currentUser?.role === "teacher") {
      fetchTeacherCourses()
    }
  }, [currentUser, teacherId])

  useEffect(() => {
    const fetchStudentsForCourse = async () => {
      if (selectedCourse) {
        try {
          const response = await api.get(
            `/attendance/courses/${selectedCourse}/students`
          )
          setStudents(response.data)

          const initialAttendance: AttendanceRecord[] = response.data.map(
            (student: Student) => ({
              studentId: student._id,
              status: "present",
            })
          )
          setAttendanceRecords(initialAttendance)
        } catch (error) {
          toast.error("Failed to load students for this course", {
            description:
              error instanceof Error ? error.message : "Unknown error",
          })
        }
      } else {
        setStudents([])
        setAttendanceRecords([])
      }
    }

    fetchStudentsForCourse()
  }, [selectedCourse])

  const handleAttendanceToggle = (studentId: string) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId
          ? {
              ...record,
              status: record.status === "present" ? "absent" : "present",
            }
          : record
      )
    )
  }

  const submitAttendance = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course")
      return
    }
    if (!selectedDate) {
      toast.error("Please select a date")
      return
    }
    if (!teacherId) {
      toast.error("Teacher ID is missing")
      return
    }
    if (!currentUser.collegeid) {
      toast.error("College information is missing")
      return
    }

    const selectedCourseDetails = teacherCourses.find(
      (course) => course._id === selectedCourse
    )
    if (!selectedCourseDetails?.departmentId?._id) {
      toast.error("Department information for the course is missing")
      return
    }

    try {
      const response = await api.post(`/attendance/mark/${teacherId}`, {
        collegeId: currentUser.collegeid,
        departmentId: selectedCourseDetails.departmentId._id,
        courseId: selectedCourse,
        date: selectedDate.toISOString(),
        attendanceRecords,
      })

      toast.success("Attendance marked successfully")
    } catch (error) {
      toast.error("Failed to submit attendance", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            value={selectedCourse}
            onValueChange={(value: string) => setSelectedCourse(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {teacherCourses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.name} ({course.code}) - {course.semesterId?.name}{" "}
                  {course.semesterId?.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setIsDatePickerOpen(true)}
            disabled={!selectedCourse}
          >
            {selectedDate?.toLocaleDateString() || "Select Date"}
          </Button>
        </div>

        {students.length > 0 && (
          <>
            <div className="mb-4">
              <Button
                onClick={submitAttendance}
                disabled={!selectedDate || students.length === 0}
              >
                Submit Attendance
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const attendanceRecord = attendanceRecords.find(
                    (record) => record.studentId === student._id
                  )
                  return (
                    <TableRow key={student._id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={
                            attendanceRecord?.status === "present"
                              ? "default"
                              : "destructive"
                          }
                          size="icon"
                          onClick={() => handleAttendanceToggle(student._id)}
                        >
                          {attendanceRecord?.status === "present" ? (
                            <CheckIcon className="h-4 w-4" />
                          ) : (
                            <XIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>

      <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Attendance Date</DialogTitle>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date?: Date) => {
              setSelectedDate(date)
              setIsDatePickerOpen(false)
            }}
            disabled={(date: Date) => date > new Date()}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default AttendanceMarkingComponent
