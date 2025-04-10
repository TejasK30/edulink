"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/api"
import { useAppStore } from "@/lib/store"
import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns"
import {
  Activity,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  XCircle,
} from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface AttendanceRecord {
  _id: string
  courseId: {
    _id: string
    name: string
    code: string
  }
  teacherId: {
    _id: string
    name: string
  }
  date: string
  status: "present" | "absent"
  createdAt: string
  updatedAt: string
}

interface AttendanceApiResponse {
  success: boolean
  data: {
    records: AttendanceRecord[]
    stats: {
      totalClasses: number
      presentClasses: number
      absentClasses: number
      attendancePercentage: number
    }
  }
  message?: string
  error?: string
}

interface CourseInfo {
  id: string
  name: string
  code: string
}

const getBarColor = (percentage: number): string => {
  if (percentage >= 75) return "#22c55e"
  if (percentage >= 60) return "#facc15"
  return "#ef4444"
}

interface MonthlyTrendData {
  month: string
  fullMonth: string
  percentage: number
}

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [courses, setCourses] = useState<CourseInfo[]>([])

  const { currentUser } = useAppStore()
  const studentId = currentUser?._id
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentId) return
      setLoading(true)
      try {
        const response = await api.get<AttendanceApiResponse>(
          `/student/attendance/${studentId}`
        )
        if (response.data.success) {
          const records = response.data.data.records
          setAttendance(records)

          const uniqueCourses = Array.from(
            new Map(
              records.map((item: AttendanceRecord) => [
                item.courseId._id,
                {
                  id: item.courseId._id,
                  name: item.courseId.name,
                  code: item.courseId.code,
                },
              ])
            ).values()
          )
          setCourses(uniqueCourses)
        } else {
          console.error(
            "API Error:",
            response.data.message || "Failed to fetch attendance"
          )
        }
      } catch (error: any) {
        console.error("Failed to fetch attendance:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [studentId])

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const courseMatch =
        courseFilter === "all" || record.courseId._id === courseFilter
      return courseMatch
    })
  }, [attendance, courseFilter])

  const stats = useMemo(() => {
    const totalClasses = filteredAttendance.length
    const presentClasses = filteredAttendance.filter(
      (record) => record.status === "present"
    ).length
    const absentClasses = totalClasses - presentClasses
    const attendancePercentage =
      totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0
    return {
      totalClasses,
      presentClasses,
      absentClasses,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
    }
  }, [filteredAttendance])

  const attendanceDates = useMemo(() => {
    return attendance.map((record) => ({
      date: parseISO(record.date),
      status: record.status,
    }))
  }, [attendance])

  const monthlyAttendanceTrend = useMemo((): MonthlyTrendData[] => {
    const numberOfMonths = 6
    const trendData: MonthlyTrendData[] = []
    const today = new Date()

    const relevantAttendance = attendance.filter((record) => {
      return courseFilter === "all" || record.courseId._id === courseFilter
    })

    for (let i = 0; i < numberOfMonths; i++) {
      const targetMonthDate = subMonths(today, i)
      const start = startOfMonth(targetMonthDate)
      const end = endOfMonth(targetMonthDate)

      const recordsInMonth = relevantAttendance.filter((record) => {
        try {
          const recordDate = parseISO(record.date)
          return isWithinInterval(recordDate, { start, end })
        } catch (e) {
          console.warn(`Invalid date format found: ${record.date}`)
          return false
        }
      })

      const totalClassesInMonth = recordsInMonth.length
      let percentage = 0

      if (totalClassesInMonth > 0) {
        const presentClassesInMonth = recordsInMonth.filter(
          (record) => record.status === "present"
        ).length
        percentage = Math.round(
          (presentClassesInMonth / totalClassesInMonth) * 100
        )
      }

      trendData.push({
        month: format(start, "MMM"),
        fullMonth: format(start, "MMMM yyyy"),
        percentage: percentage,
      })
    }

    return trendData.reverse()
  }, [attendance, courseFilter])

  const handleMonthChange = (date: Date | undefined) => {
    if (date) {
      setCurrentMonth(date)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">My Attendance</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex flex-col items-center pt-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <p className="text-3xl font-bold">{stats.totalClasses}</p>
            )}
            <p className="text-sm text-muted-foreground">Total Classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center pt-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <p className="text-3xl font-bold">{stats.presentClasses}</p>
            )}
            <p className="text-sm text-muted-foreground">Classes Attended</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center pt-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="flex items-end">
                <p className="text-3xl font-bold">
                  {stats.attendancePercentage}%
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="w-full md:w-auto md:min-w-[250px]">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>
                Attendance Records (
                {courseFilter === "all"
                  ? "All Courses"
                  : courses.find((c) => c.id === courseFilter)?.code}
                )
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 py-3 border-b"
                  >
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20 ml-auto" />
                  </div>
                ))
              ) : filteredAttendance.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No attendance records found{" "}
                  {courseFilter !== "all" ? `for the selected course` : ""}.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredAttendance.map((record) => (
                    <div
                      key={record._id}
                      className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 rounded-md"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                        <div className="flex items-center space-x-2 text-sm md:text-base">
                          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span>
                            {format(parseISO(record.date), "dd MMM yy")}
                          </span>
                        </div>
                        <div className="text-sm md:text-base mt-1 md:mt-0">
                          <span className="font-medium md:hidden">
                            Course:{" "}
                          </span>
                          <span>
                            {record.courseId.code} - {record.courseId.name}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 text-right md:text-left">
                        {record.status === "present" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" /> Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            <XCircle className="h-3 w-3 mr-1" /> Absent
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>
                  Attendance Calendar ({format(currentMonth, "MMMM yyyy")})
                </span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">Present</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm">Absent</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={undefined}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                className="rounded-md border p-0"
                modifiers={{
                  present: attendanceDates
                    .filter((d) => d.status === "present")
                    .map((d) => d.date),
                  absent: attendanceDates
                    .filter((d) => d.status === "absent")
                    .map((d) => d.date),
                }}
                modifiersClassNames={{
                  present:
                    "bg-green-100 text-green-900 dark:bg-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700",
                  absent:
                    "bg-red-100 text-red-900 dark:bg-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700",
                }}
                components={{
                  IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                  IconRight: () => <ChevronRight className="h-4 w-4" />,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Monthly Attendance Trend (
              {courseFilter === "all"
                ? "All Courses"
                : courses.find((c) => c.id === courseFilter)?.code}
              )
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-60 w-full" />
            ) : monthlyAttendanceTrend.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-muted-foreground">
                No attendance data available for the past{" "}
                {monthlyAttendanceTrend.length} months
                {courseFilter !== "all" ? " for this course" : ""}.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={monthlyAttendanceTrend}
                  margin={{
                    top: 5,
                    right: 10,
                    left: -10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-md shadow-lg p-2 text-sm">
                            <p className="font-bold">
                              {payload[0].payload.fullMonth}
                            </p>
                            <p
                              style={{
                                color: getBarColor(payload[0].value as number),
                              }}
                            >
                              Attendance: {payload[0].value}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                    {monthlyAttendanceTrend.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.percentage)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
