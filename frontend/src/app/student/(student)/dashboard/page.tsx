"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CalendarIcon,
  GraduationCapIcon,
  BookOpenIcon,
  UserCheckIcon,
  BriefcaseIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/lib/store"
import Link from "next/link"
import { dashboardService } from "@/services/dashboardService"

interface StudentInfo {
  name: string
  email: string
  college: string
  department: string
}

interface CurrentSemester {
  name: string
  year: number
}

interface topicSchema {
  title: string
  description: string
}

interface Course {
  _id: string
  name: string
  code: string
  credits: number
  teacherId?: {
    name: string
  } | null
  topics?: topicSchema[]
}

interface Assignment {
  _id: string
  title: string
  dueDate: string
  questions: string[]
  courseId: {
    name: string
  }
}

interface Grade {
  _id: string
  courseId: {
    name: string
  }
  gradeType: string
  gradeValue: number
  createdAt: string
}

interface Attendance {
  _id: string
  courseName: string
  courseCode: string
  present: number
  absent: number
  total: number
  attendancePercentage: number
}

interface JobPosting {
  _id: string
  companyName: string
  createdAt: string
  jobDescription: string
  role: string
  applyLink: string
}

interface DashboardData {
  studentInfo: StudentInfo
  currentSemester: CurrentSemester
  enrolledCourses: Course[]
  upcomingAssignments: Assignment[]
  recentGrades: Grade[]
  attendanceSummary: Attendance[]
  jobPostings: JobPosting[]
}

const StudentDashboard = () => {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAppStore()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!currentUser) return
        const response = await dashboardService.getStudentDashboard(
          currentUser._id as string
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
  }, [currentUser, currentUser?._id, currentUser?.role, router])

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
    studentInfo,
    currentSemester,
    enrolledCourses,
    upcomingAssignments,
    recentGrades,
    attendanceSummary,
    jobPostings,
  } = dashboardData

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {studentInfo.name}!
        </h1>
        <p className="mt-1">
          Current Semester: {currentSemester.name} {currentSemester.year}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentSemester.name} {currentSemester.year}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Assignments Due
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingAssignments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upcoming this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Attendance
            </CardTitle>
            <UserCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceSummary.length > 0
                ? Math.round(
                    attendanceSummary.reduce(
                      (sum: number, course: Attendance) =>
                        sum + course.attendancePercentage,
                      0
                    ) / attendanceSummary.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Job Opportunities
            </CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobPostings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">New postings</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="grades">Recent Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="jobs">Job Board</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments" className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Assignments</h2>
          {upcomingAssignments.length > 0 ? (
            <div className="grid gap-4">
              {upcomingAssignments.map((assignment: Assignment) => (
                <Card key={assignment._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>
                          {assignment.courseId.name}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          new Date(assignment.dueDate) <=
                          new Date(
                            new Date().getTime() + 2 * 24 * 60 * 60 * 1000
                          )
                            ? "destructive"
                            : "outline"
                        }
                      >
                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {assignment.questions.length} questions
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-xs text-muted-foreground">
                      {new Date(assignment.dueDate).toLocaleDateString()} at{" "}
                      {new Date(assignment.dueDate).toLocaleTimeString()}
                    </div>
                    <Link href={`/student/assignments/${assignment._id}`}>
                      <Badge
                        variant="secondary"
                        className="bg-primary/70 hover:bg-primary"
                      >
                        View Details
                      </Badge>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <CheckCircleIcon size={48} className="text-green-500 mb-4" />
                  <h3 className="text-xl font-medium mb-1">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    You don&apos;t have any upcoming assignments due.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="courses" className="space-y-4">
          <h2 className="text-xl font-semibold">My Courses</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course: Course) => (
              <Card key={course._id}>
                <CardHeader>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>
                    <span className="font-mono">{course.code}</span> •{" "}
                    {course.credits} Credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Instructor:</span>
                      <span className="font-medium">
                        {course.teacherId?.name || "TBA"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge>Active</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-muted-foreground">
                    Topics: {course.topics?.length || 0}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="grades" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Grades</h2>
          {recentGrades.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGrades.map((grade: Grade) => (
                  <TableRow key={grade._id}>
                    <TableCell className="font-medium">
                      {grade.courseId.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {grade.gradeType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            grade.gradeValue >= 9
                              ? "text-green-600"
                              : grade.gradeValue >= 8
                              ? "text-blue-600"
                              : grade.gradeValue >= 7
                              ? "text-yellow-600"
                              : "text-red-600"
                          }
                        >
                          {grade.gradeValue} / 10
                        </span>
                        <Progress
                          value={(grade.gradeValue / 10) * 100}
                          className="h-2 w-16"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(grade.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <GraduationCapIcon
                    size={48}
                    className="text-orange-500 mb-4"
                  />
                  <h3 className="text-xl font-medium mb-1">No Recent Grades</h3>
                  <p className="text-muted-foreground">
                    You don&apos;t have any recent grade entries.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="attendance" className="space-y-4">
          <h2 className="text-xl font-semibold">Attendance Summary</h2>
          {attendanceSummary.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {attendanceSummary.map((attendance: Attendance) => (
                <Card key={attendance._id}>
                  <CardHeader>
                    <CardTitle>{attendance.courseName}</CardTitle>
                    <CardDescription>{attendance.courseCode}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Present:</span>
                        <span className="font-medium">
                          {attendance.present} days
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Absent:</span>
                        <span className="font-medium">
                          {attendance.absent} days
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span>Attendance Rate:</span>
                          <span
                            className={
                              attendance.attendancePercentage >= 90
                                ? "text-green-600"
                                : attendance.attendancePercentage >= 75
                                ? "text-yellow-600"
                                : "text-red-600"
                            }
                          >
                            {Math.round(attendance.attendancePercentage)}%
                          </span>
                        </div>
                        <Progress
                          value={attendance.attendancePercentage}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <UserCheckIcon size={48} className="text-blue-500 mb-4" />
                  <h3 className="text-xl font-medium mb-1">
                    No Attendance Data
                  </h3>
                  <p className="text-muted-foreground">
                    There is no attendance data available yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="jobs" className="space-y-4">
          <h2 className="text-xl font-semibold">Job Opportunities</h2>
          {jobPostings.length > 0 ? (
            <div className="grid gap-4">
              {jobPostings.map((job: JobPosting) => (
                <Card key={job._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.companyName}</CardTitle>
                        <CardDescription>
                          Posted on{" "}
                          {new Date(job.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge>New</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">{job.jobDescription}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-xs text-muted-foreground">
                      Posted by{" "}
                      {job.role === "admin" ? "Administration" : "Faculty"}
                    </div>
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      Apply Now
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <BriefcaseIcon size={48} className="text-purple-500 mb-4" />
                  <h3 className="text-xl font-medium mb-1">No Job Postings</h3>
                  <p className="text-muted-foreground">
                    There are no job opportunities posted at the moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StudentDashboard
