"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useEffect, useState } from "react"

interface Department {
  _id: string
  name: string
}

interface Course {
  _id: string
  name: string
  code: string
}

interface Student {
  _id: string
  name: string
  email: string
}

const MarkAttendancePage = () => {
  // Use arrays for collections.
  const [departments, setDepartments] = useState<Department[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("")
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<{
    [studentId: string]: "present" | "absent"
  }>({})
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [markingAttendance, setMarkingAttendance] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/teacher/departments", {
          headers: {
            "x-teacher-id": localStorage.getItem("teacherId") || "",
          },
        })
        if (response.ok) {
          const data: Department[] = await response.json()
          setDepartments(data)
        } else {
          const errorData = await response.json()
          toast({
            title: "Error fetching departments.",
            description: errorData.message,
            variant: "destructive",
          })
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"
        toast({
          title: "Error fetching departments.",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [toast])

  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedDepartmentId) return
      setLoadingCourses(true)
      try {
        const response = await fetch(
          `/api/teacher/courses/${selectedDepartmentId}`,
          {
            headers: {
              "x-teacher-id": localStorage.getItem("teacherId") || "",
            },
          }
        )
        if (response.ok) {
          const data: Course[] = await response.json()
          setCourses(data)
        } else {
          const errorData = await response.json()
          toast({
            title: "Error fetching courses.",
            description: errorData.message,
            variant: "destructive",
          })
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"
        toast({
          title: "Error fetching courses.",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoadingCourses(false)
      }
    }

    // Clear dependent state on department change.
    setCourses([])
    setSelectedCourseId("")
    setStudents([])
    setAttendance({})
    fetchCourses()
  }, [selectedDepartmentId, toast])

  // Fetch students when course changes.
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourseId) return
      setLoadingStudents(true)
      try {
        const response = await fetch(
          `/api/courses/${selectedCourseId}/students`,
          {
            headers: {
              "x-teacher-id": localStorage.getItem("teacherId") || "",
            },
          }
        )
        if (response.ok) {
          const studentsData: Student[] = await response.json()
          setStudents(studentsData)
          const initialAttendance: {
            [studentId: string]: "present" | "absent"
          } = {}
          studentsData.forEach((student) => {
            initialAttendance[student._id] = "present" // Default to present.
          })
          setAttendance(initialAttendance)
        } else {
          const errorData = await response.json()
          toast({
            title: "Error fetching students.",
            description: errorData.message,
            variant: "destructive",
          })
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"
        toast({
          title: "Error fetching students.",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoadingStudents(false)
      }
    }

    // Clear dependent state on course change.
    setStudents([])
    setAttendance({})
    fetchStudents()
  }, [selectedCourseId, toast])

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartmentId(value)
  }

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(value)
  }

  const handleAttendanceChange = (
    studentId: string,
    status: "present" | "absent"
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleSubmitAttendance = async () => {
    if (!selectedDepartmentId || !selectedCourseId || !selectedDate) {
      toast({
        title: "Please select department, course, and date.",
        variant: "destructive",
      })
      return
    }

    setMarkingAttendance(true)
    const attendanceRecords = Object.keys(attendance).map((studentId) => ({
      studentId,
      status: attendance[studentId],
    }))

    try {
      const response = await fetch("/api/teacher/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-teacher-id": localStorage.getItem("teacherId") || "",
        },
        body: JSON.stringify({
          departmentId: selectedDepartmentId,
          courseId: selectedCourseId,
          date: selectedDate,
          attendanceRecords,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        toast({ title: "Attendance marked successfully!" })
      } else {
        toast({
          title: "Failed to mark attendance.",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Error marking attendance.",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setMarkingAttendance(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Mark Attendance</h1>

      <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="department">Department</Label>
          <Select
            onValueChange={handleDepartmentChange}
            value={selectedDepartmentId}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {loadingDepartments ? (
                <SelectItem value="" disabled>
                  Loading...
                </SelectItem>
              ) : (
                departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="course">Course</Label>
          <Select
            onValueChange={handleCourseChange}
            value={selectedCourseId}
            disabled={!selectedDepartmentId}
          >
            <SelectTrigger id="course">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {loadingCourses ? (
                <SelectItem value="" disabled>
                  Loading...
                </SelectItem>
              ) : (
                courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedCourseId && selectedDate && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Students in this Course
          </h2>
          {loadingStudents ? (
            <p>Loading students...</p>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Student Name</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        {student.name} ({student.email})
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={attendance[student._id] === "present"}
                          onCheckedChange={(checked) =>
                            handleAttendanceChange(
                              student._id,
                              checked ? "present" : "absent"
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={attendance[student._id] === "absent"}
                          onCheckedChange={(checked) =>
                            handleAttendanceChange(
                              student._id,
                              checked ? "absent" : "present"
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>No students enrolled in this course.</p>
          )}

          {students.length > 0 && (
            <Button
              onClick={handleSubmitAttendance}
              disabled={markingAttendance}
            >
              {markingAttendance ? "Marking..." : "Mark Attendance"}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default MarkAttendancePage
