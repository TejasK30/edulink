import { format } from "date-fns"

export interface StudentInfo {
  name: string
  email: string
  college: string
  department: string
}

export interface CurrentSemester {
  name: string
  year: number
}

export interface topicSchema {
  title: string
  description: string
}

export interface Course {
  _id: string
  name: string
  code: string
  credits: number
  teacherId?: {
    name: string
  } | null
  topics?: topicSchema[]
}

export interface Assignment {
  _id: string
  title: string
  dueDate: string
  questions: string[]
  courseId: {
    name: string
  }
}

export interface Grade {
  _id: string
  courseId: {
    name: string
  }
  gradeType: string
  gradeValue: number
  createdAt: string
}

export interface Attendance {
  _id: string
  courseName: string
  courseCode: string
  present: number
  absent: number
  total: number
  attendancePercentage: number
}

export interface JobPosting {
  _id: string
  companyName: string
  createdAt: string
  jobDescription: string
  role: string
  applyLink: string
}

export interface DashboardData {
  studentInfo: StudentInfo
  currentSemester: CurrentSemester
  enrolledCourses: Course[]
  upcomingAssignments: Assignment[]
  recentGrades: Grade[]
  attendanceSummary: Attendance[]
  jobPostings: JobPosting[]
}

export interface AssignmentPageCourse {
  _id: string
  name: string
  code: string
}

export interface AssignmentPageType {
  _id: string
  title: string
  name: string
  dueDate: string
  teacherId: { _id: string; name: string }
}

export interface AttendanceRecord {
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

export interface CourseInfo {
  id: string
  name: string
  code: string
}

export interface AttendanceApiResponse {
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

export function filterRecords(
  records: AttendanceRecord[],
  courseFilter: string
): AttendanceRecord[] {
  if (!courseFilter || courseFilter === "all") return records

  return records.filter(
    (record) =>
      record.courseId._id === courseFilter ||
      record.courseId.name === courseFilter ||
      record.courseId.code === courseFilter
  )
}

export function mapDatesByStatus(records: AttendanceRecord[]): {
  presentDates: Date[]
  absentDates: Date[]
} {
  const presentDates: Date[] = []
  const absentDates: Date[] = []

  records.forEach((record) => {
    const dateObj = new Date(record.date)

    if (record.status === "present") {
      presentDates.push(dateObj)
    } else if (record.status === "absent") {
      absentDates.push(dateObj)
    }
  })

  return { presentDates, absentDates }
}

export function computeStats(records: AttendanceRecord[]): {
  totalClasses: number
  presentClasses: number
  absentClasses: number
  attendancePercentage: number
} {
  const totalClasses = records.length
  const presentClasses = records.filter((r) => r.status === "present").length
  const absentClasses = records.filter((r) => r.status === "absent").length

  const attendancePercentage =
    totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0

  return {
    totalClasses,
    presentClasses,
    absentClasses,
    attendancePercentage,
  }
}

export function computeMonthlyTrend(
  records: AttendanceRecord[],
  courseFilter: string
): { month: string; fullMonth: string; percentage: number }[] {
  // filter by course if not "all"
  const filtered =
    courseFilter === "all"
      ? records
      : records.filter(
          (r) =>
            r.courseId._id === courseFilter ||
            r.courseId.code === courseFilter ||
            r.courseId.name === courseFilter
        )

  // group by month (YYYY-MM)
  const monthMap: Record<
    string,
    { present: number; total: number; date: Date }
  > = {}

  filtered.forEach((record) => {
    const date = new Date(record.date)
    const key = format(date, "yyyy-MM") // grouping key
    if (!monthMap[key]) {
      monthMap[key] = { present: 0, total: 0, date }
    }
    monthMap[key].total += 1
    if (record.status === "present") {
      monthMap[key].present += 1
    }
  })

  // convert to array sorted by date
  const trend = Object.entries(monthMap)
    .map(([key, { present, total, date }]) => {
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0
      return {
        month: format(date, "MMM yy"), // short label for X-axis
        fullMonth: format(date, "MMMM yyyy"), // full name for tooltip
        percentage,
      }
    })
    .sort(
      (a, b) =>
        new Date(a.fullMonth).getTime() - new Date(b.fullMonth).getTime()
    )

  return trend
}

// ✅ Choose bar color based on percentage
export function getBarColor(percentage: number): string {
  if (percentage >= 80) return "#22c55e" // green
  if (percentage >= 50) return "#eab308" // yellow
  return "#ef4444" // red
}
