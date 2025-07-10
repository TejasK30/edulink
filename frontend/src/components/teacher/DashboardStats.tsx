import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   Assignment,
//   AttendanceSummary,
//   Course,
//   CourseEnrollment,
//   CurrentSemester,
// } from "@/hooks/useTDashboard"

import {
  BookOpenIcon,
  CalendarIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react"

interface DashboardStatsProps {
  courses: Course[]
  courseEnrollments: CourseEnrollment[]
  upcomingAssignments: Assignment[]
  attendanceSummary: AttendanceSummary[]
  currentSemester: CurrentSemester | null
}

export const DashboardStats = ({
  courses,
  courseEnrollments,
  upcomingAssignments,
  attendanceSummary,
  currentSemester,
}: DashboardStatsProps) => {
  const totalStudents = courseEnrollments.reduce(
    (sum: number, course: CourseEnrollment) => sum + course.studentCount,
    0
  )

  const averageAttendance =
    attendanceSummary.length > 0
      ? Math.round(
          attendanceSummary.reduce(
            (sum: number, course: AttendanceSummary) =>
              sum + course.attendanceRate,
            0
          ) / attendanceSummary.length
        )
      : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">My Courses</CardTitle>
          <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{courses.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {currentSemester?.name} {currentSemester?.year}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all courses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <UserCheckIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageAttendance}%</div>
          <p className="text-xs text-muted-foreground mt-1">Class average</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Assignments
          </CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Assignments due soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
