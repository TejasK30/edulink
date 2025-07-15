"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/providers/auth-provider"
import { dashboardService } from "@/services/dashboardService"
import {
  AlertCircleIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalendarIcon,
  GraduationCapIcon,
  PlusIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface TeacherInfo {
  name: string
  email: string
  college: string
  department: string
}

interface CurrentSemester {
  name: string
  year: number
}

interface Course {
  _id: string
  name: string
  code: string
  credits: number
  capacity?: number
}

interface CourseEnrollment {
  courseId: string
  courseName: string
  courseCode: string
  studentCount: number
}

interface Assignment {
  _id: string
  title: string
  dueDate: string
  courseId: {
    name: string
  }
}

interface Grade {
  _id: string
  studentId: {
    name: string
  } | null
  courseId: {
    name: string
  }
  assignmentId: {
    title: string
  }
  score: number
}

interface AttendanceSummary {
  _id: string
  courseName: string
  courseCode: string
  present: number
  absent: number
  total: number
  attendanceRate: number
}

interface JobPosting {
  _id: string
  title: string
  company: string
  location: string
  type: string
  createdAt: string
}

interface DashboardData {
  teacherInfo: TeacherInfo
  currentSemester: CurrentSemester | null
  courses: Course[]
  courseEnrollments: CourseEnrollment[]
  upcomingAssignments: Assignment[]
  recentGrades: Grade[]
  attendanceSummary: AttendanceSummary[]
  jobPostings: JobPosting[]
}

const TeacherDashboard = () => {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!currentUser) return

        if (currentUser.role !== "teacher") {
          router.push(`/${currentUser.role}/dashboard`)
          return
        }

        const response = await dashboardService.getTeacherDashboard(
          currentUser.id as string
        )
        setDashboardData(response.data)
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [currentUser, router])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center">
            <AlertCircleIcon className="mr-2" size={20} />
            Error Loading Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            {error || "Failed to load dashboard data"}
          </p>
        </CardContent>
      </Card>
    )
  }

  const {
    teacherInfo,
    currentSemester,
    courses,
    courseEnrollments,
    upcomingAssignments,
    recentGrades,
    attendanceSummary,
    jobPostings,
  } = dashboardData

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
    <div className="space-y-8">
      <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, Professor{" "}
          {teacherInfo.name.split(" ")[1] || teacherInfo.name}!
        </h1>
        <p className="mt-1">
          Current Semester: {currentSemester?.name} {currentSemester?.year}
        </p>
      </div>
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
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
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
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
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
            <div className="text-2xl font-bold">
              {upcomingAssignments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Assignments due soon
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="grades">Recent Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="jobs">Job Board</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Courses</h2>
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: Course) => {
              const enrollment = courseEnrollments.find(
                (e: CourseEnrollment) =>
                  e.courseId.toString() === course._id.toString()
              )
              return (
                <Card key={course._id}>
                  <CardHeader>
                    <CardTitle>{course.name}</CardTitle>
                    <CardDescription>
                      <span className="font-mono">{course.code}</span> •{" "}
                      {course.credits} Credits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Students Enrolled:</span>
                        <span className="font-medium">
                          {enrollment?.studentCount || 0}
                          {course.capacity ? ` / ${course.capacity}` : ""}
                        </span>
                      </div>
                      {course.capacity && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span>Capacity:</span>
                            <span>
                              {Math.round(
                                ((enrollment?.studentCount || 0) /
                                  course.capacity) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              ((enrollment?.studentCount || 0) /
                                course.capacity) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View Course
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Assignments</h2>
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </div>
          {upcomingAssignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAssignments.map((assignment: Assignment) => (
                  <TableRow key={assignment._id}>
                    <TableCell className="font-medium">
                      {assignment.title}
                    </TableCell>
                    <TableCell>{assignment.courseId.name}</TableCell>
                    <TableCell>
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          new Date(assignment.dueDate) <=
                          new Date(
                            new Date().getTime() + 2 * 24 * 60 * 60 * 1000
                          )
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {new Date(assignment.dueDate) <=
                        new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)
                          ? "Due Soon"
                          : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CalendarIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No upcoming assignments found.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="grades">
          <h2 className="text-xl font-semibold mb-4">Recent Grades</h2>
          {recentGrades.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGrades.map((grade: Grade) => (
                  <TableRow key={grade._id}>
                    <TableCell className="font-medium">
                      {grade.studentId && grade.studentId.name
                        ? grade.studentId.name
                        : "N/A"}
                    </TableCell>
                    <TableCell>{grade.courseId.name}</TableCell>
                    <TableCell>{grade.assignmentId.title}</TableCell>
                    <TableCell>{grade.score}%</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <GraduationCapIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No recent grades available.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="attendance">
          <h2 className="text-xl font-semibold mb-4">Attendance Summary</h2>
          {attendanceSummary.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Total Sessions</TableHead>
                  <TableHead>Sessions Attended</TableHead>
                  <TableHead>Attendance Rate</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceSummary.map((summary: AttendanceSummary) => (
                  <TableRow key={summary._id}>
                    <TableCell className="font-medium">
                      {summary.courseName}
                    </TableCell>
                    <TableCell>{summary.total}</TableCell>
                    <TableCell>{summary.present}</TableCell>
                    <TableCell>{summary.attendanceRate}%</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <UserCheckIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No attendance data available.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="jobs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Job Postings</h2>
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </div>
          {jobPostings.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobPostings.map((job: JobPosting) => (
                <Card key={job._id}>
                  <CardHeader>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <BriefcaseIcon className="mr-1 inline-block h-4 w-4" />
                      {job.location}
                    </p>
                    <Badge>{job.type}</Badge>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BriefcaseIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No job postings available.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TeacherDashboard
