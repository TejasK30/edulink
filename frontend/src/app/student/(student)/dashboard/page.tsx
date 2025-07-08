"use client"

import { AssignmentsTab } from "@/components/student/dashboard/AssignmentsTab"
import { AttendanceTab } from "@/components/student/dashboard/AttendanceTab"
import { CoursesTab } from "@/components/student/dashboard/CoursesTab"
import { ErrorCard } from "@/components/student/dashboard/DashboardError"
import { DashboardSkeleton } from "@/components/student/dashboard/DashboardSkeleton"
import { GradesTab } from "@/components/student/dashboard/GradesTab"
import { JobsTab } from "@/components/student/dashboard/JobsTab"
import { StatsCard } from "@/components/student/dashboard/StatsCard"
import { WelcomeBanner } from "@/components/student/dashboard/WelcomeBanner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-provider"
import { dashboardService } from "@/services/dashboardService"
import { Attendance, DashboardData } from "@/types/student.types"
import { useQuery } from "@tanstack/react-query"
import {
  BookOpenIcon,
  BriefcaseIcon,
  CalendarIcon,
  UserCheckIcon,
} from "lucide-react"

const StudentDashboard = () => {
  const { user: currentUser } = useAuth()

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<DashboardData>({
    queryKey: ["studentDashboard", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error("User not authenticated")
      const response = await dashboardService.getStudentDashboard(
        currentUser.id as string
      )
      return response.data
    },
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !dashboardData) {
    return (
      <ErrorCard
        error={
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data"
        }
      />
    )
  }

  const {
    studentInfo,
    currentSemester,
    enrolledCourses,
    upcomingAssignments,
    recentGrades,
    attendanceSummary,
    jobPostings,
  } = dashboardData

  const averageAttendance =
    attendanceSummary.length > 0
      ? Math.round(
          attendanceSummary.reduce(
            (sum: number, course: Attendance) =>
              sum + course.attendancePercentage,
            0
          ) / attendanceSummary.length
        )
      : 0

  return (
    <div className="space-y-8">
      <WelcomeBanner
        studentName={studentInfo.name}
        currentSemester={currentSemester}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Enrolled Courses"
          value={enrolledCourses.length}
          subtitle={`${currentSemester.name} ${currentSemester.year}`}
          icon={BookOpenIcon}
        />
        <StatsCard
          title="Assignments Due"
          value={upcomingAssignments.length}
          subtitle="Upcoming this week"
          icon={CalendarIcon}
        />
        <StatsCard
          title="Average Attendance"
          value={`${averageAttendance}%`}
          subtitle="Across all courses"
          icon={UserCheckIcon}
        />
        <StatsCard
          title="Job Opportunities"
          value={jobPostings.length}
          subtitle="New postings"
          icon={BriefcaseIcon}
        />
      </div>

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="grades">Recent Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="jobs">Job Board</TabsTrigger>
        </TabsList>

        <AssignmentsTab assignments={upcomingAssignments} />
        <CoursesTab courses={enrolledCourses} />
        <GradesTab grades={recentGrades} />
        <AttendanceTab attendance={attendanceSummary} />
        <JobsTab jobs={jobPostings} />
      </Tabs>
    </div>
  )
}

export default StudentDashboard
