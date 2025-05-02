"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/api"
import { User } from "@/lib/store"
import axios from "axios"
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Building,
  CalendarDays,
  GraduationCap,
  Mail,
  User as UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

type UserProfileExtended = User & {
  department?: {
    _id: string
    name: string
  }
  enrolledCourses?: Array<{
    _id: string
    name: string
    code: string
    credits: number
  }>
  attendance?: Array<{
    _id: string
    courseId: {
      _id: string
      name: string
      code: string
    }
    date: string
    status: "present" | "absent"
  }>
  grades?: Array<{
    _id: string
    courseId: {
      _id: string
      name: string
      code: string
    }
    gradeValue: number
    gradeType: "assignment" | "exam"
    updatedAt: string
  }>
  teachingCourses?: Array<{
    _id: string
    name: string
    code: string
    credits: number
    enrolledStudents: number
  }>
  feedbacks?: Array<{
    _id: string
    rating: number
    message: string
    createdAt: string
  }>
  createdAt?: string
  updatedAt?: string
}

const UserProfilePage = () => {
  const { role, id } = useParams() as { role: string; id: string }
  const [user, setUser] = useState<UserProfileExtended | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id || !role) return

      try {
        setLoading(true)
        const response = await api.get<UserProfileExtended>(
          `/admin/users/${role}/${id}`
        )

        if (response.status === 200) {
          setUser(response.data)
        } else {
          setError("Failed to fetch user data")
        }
      } catch (err: any) {
        setError(
          err.message || "An error occurred while fetching the user data"
        )
        console.error("Error fetching user data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id, role])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">
            Loading user profile...
          </p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-red-600">{error || "User not found"}</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href={`/admin/users/${role}s`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {role}s list
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const calculateAttendancePercentage = () => {
    if (!user.attendance || user.attendance.length === 0) {
      return "No attendance data"
    }

    const totalClasses = user.attendance.length
    const presentCount = user.attendance.filter(
      (a) => a.status === "present"
    ).length
    const percentage = (presentCount / totalClasses) * 100

    return `${percentage.toFixed(1)}%`
  }

  const calculateGPA = () => {
    if (!user.grades || user.grades.length === 0) {
      return "No grade data"
    }

    const total = user.grades.reduce((sum, grade) => sum + grade.gradeValue, 0)
    const average = total / user.grades.length

    let gpa = 0
    if (average >= 90) gpa = 4.0
    else if (average >= 80) gpa = 3.0
    else if (average >= 70) gpa = 2.0
    else if (average >= 60) gpa = 1.0

    return gpa.toFixed(1)
  }

  const averageFeedbackRating = () => {
    if (!user.feedbacks || user.feedbacks.length === 0) {
      return "No feedback data"
    }

    const total = user.feedbacks.reduce(
      (sum, feedback) => sum + feedback.rating,
      0
    )
    return (total / user.feedbacks.length).toFixed(1)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/admin/users/${role}s`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {role}s list
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4 mr-2" />
                  ID
                </div>
                <span className="font-medium">{user._id}</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="h-4 w-4 mr-2" />
                  Role
                </div>
                <Badge variant="outline" className="capitalize">
                  {role}
                </Badge>
              </div>

              {user.department && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Department
                    </div>
                    <span className="font-medium">{user.department.name}</span>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Joined
                </div>
                <span className="font-medium">
                  {formatDate(user.createdAt)}
                </span>
              </div>

              {role === "student" && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Attendance
                    </div>
                    <span className="font-medium">
                      {calculateAttendancePercentage()}
                    </span>
                  </div>

                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      GPA
                    </div>
                    <span className="font-medium">{calculateGPA()}</span>
                  </div>
                </>
              )}

              {role === "teacher" && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Courses Teaching
                    </div>
                    <span className="font-medium">
                      {user.teachingCourses?.length || 0}
                    </span>
                  </div>

                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Feedback Rating
                    </div>
                    <span className="font-medium">
                      {averageFeedbackRating()}
                    </span>
                  </div>
                </>
              )}

              <Separator />
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Last Updated
                </div>
                <span className="font-medium">
                  {formatDate(user.updatedAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Detailed information for {user.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {role === "student" && (
                  <>
                    <TabsTrigger value="courses">Courses</TabsTrigger>
                    <TabsTrigger value="grades">Grades</TabsTrigger>
                  </>
                )}
                {role === "teacher" && (
                  <>
                    <TabsTrigger value="courses">Courses</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  </>
                )}
                {role === "admin" && (
                  <>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Profile Summary</h3>
                    <p className="text-muted-foreground mt-2">
                      {role === "student" &&
                        "Student enrolled in the institution with access to courses, grades, and attendance records."}
                      {role === "teacher" &&
                        "Faculty member responsible for teaching courses and evaluating student performance."}
                      {role === "admin" &&
                        "Administrative staff member with management privileges across the institution."}
                    </p>
                  </div>

                  {user.department && (
                    <div>
                      <h3 className="text-lg font-medium">
                        Department Information
                      </h3>
                      <div className="mt-2 p-4 bg-muted rounded-md">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Department Name:
                          </span>
                          <span className="font-medium">
                            {user.department.name}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-muted-foreground">
                            Department ID:
                          </span>
                          <span className="font-medium">
                            {user.department._id}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {role === "student" && user.enrolledCourses && (
                    <div>
                      <h3 className="text-lg font-medium">Academic Status</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold">
                                {user.enrolledCourses.length}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Enrolled Courses
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold">
                                {calculateAttendancePercentage()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Attendance Rate
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold">
                                {calculateGPA()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Current GPA
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {role === "teacher" && user.teachingCourses && (
                    <div>
                      <h3 className="text-lg font-medium">Teaching Status</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold">
                                {user.teachingCourses.length}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Active Courses
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold">
                                {user.teachingCourses.reduce(
                                  (total, course) =>
                                    total + course.enrolledStudents,
                                  0
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Total Students
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold">
                                {averageFeedbackRating()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Avg. Rating
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <div className="mt-2 p-4 bg-muted rounded-md">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {role === "student" && (
                <TabsContent value="courses">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Enrolled Courses</h3>
                      <Badge variant="outline">
                        {user.enrolledCourses?.length || 0} Courses
                      </Badge>
                    </div>

                    {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course Code</TableHead>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Attendance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.enrolledCourses.map((course) => {
                            const courseAttendance =
                              user.attendance?.filter(
                                (a) => a.courseId._id === course._id
                              ) || []

                            const presentCount = courseAttendance.filter(
                              (a) => a.status === "present"
                            ).length

                            const attendanceRate =
                              courseAttendance.length > 0
                                ? (
                                    (presentCount / courseAttendance.length) *
                                    100
                                  ).toFixed(1) + "%"
                                : "N/A"

                            return (
                              <TableRow key={course._id}>
                                <TableCell className="font-medium">
                                  {course.code}
                                </TableCell>
                                <TableCell>{course.name}</TableCell>
                                <TableCell>{course.credits}</TableCell>
                                <TableCell>{attendanceRate}</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-6 text-center bg-muted rounded-md">
                        <p className="text-muted-foreground">
                          No courses enrolled
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {role === "student" && (
                <TabsContent value="grades">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        Academic Performance
                      </h3>
                      <Badge variant="outline">GPA: {calculateGPA()}</Badge>
                    </div>

                    {user.grades && user.grades.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.grades.map((grade) => (
                            <TableRow key={grade._id}>
                              <TableCell className="font-medium">
                                {grade.courseId.name} ({grade.courseId.code})
                              </TableCell>
                              <TableCell className="capitalize">
                                {grade.gradeType}
                              </TableCell>
                              <TableCell>
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <span className="cursor-help font-medium">
                                      {grade.gradeValue}%
                                    </span>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-60">
                                    <div className="space-y-2">
                                      <p className="text-sm">
                                        Grade: {grade.gradeValue}%
                                      </p>
                                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-primary"
                                          style={{
                                            width: `${grade.gradeValue}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {grade.gradeValue >= 90
                                          ? "A"
                                          : grade.gradeValue >= 80
                                          ? "B"
                                          : grade.gradeValue >= 70
                                          ? "C"
                                          : grade.gradeValue >= 60
                                          ? "D"
                                          : "F"}{" "}
                                        (
                                        {grade.gradeValue >= 60
                                          ? "Pass"
                                          : "Fail"}
                                        )
                                      </p>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </TableCell>
                              <TableCell>
                                {formatDate(grade.updatedAt)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-6 text-center bg-muted rounded-md">
                        <p className="text-muted-foreground">
                          No grades recorded
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {role === "teacher" && (
                <TabsContent value="courses">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Teaching Courses</h3>
                      <Badge variant="outline">
                        {user.teachingCourses?.length || 0} Courses
                      </Badge>
                    </div>

                    {user.teachingCourses && user.teachingCourses.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course Code</TableHead>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Students</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.teachingCourses.map((course) => (
                            <TableRow key={course._id}>
                              <TableCell className="font-medium">
                                {course.code}
                              </TableCell>
                              <TableCell>{course.name}</TableCell>
                              <TableCell>{course.credits}</TableCell>
                              <TableCell>{course.enrolledStudents}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-6 text-center bg-muted rounded-md">
                        <p className="text-muted-foreground">
                          No courses assigned
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {role === "teacher" && (
                <TabsContent value="feedback">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Student Feedback</h3>
                      <Badge variant="outline">
                        Rating: {averageFeedbackRating()}
                      </Badge>
                    </div>

                    {user.feedbacks && user.feedbacks.length > 0 ? (
                      <div className="space-y-4">
                        {user.feedbacks.map((feedback) => (
                          <Card key={feedback._id}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg
                                        key={star}
                                        className={`h-5 w-5 ${
                                          star <= feedback.rating
                                            ? "text-yellow-400"
                                            : "text-gray-200"
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 15.585l-6.327 3.323 1.209-7.04-5.117-4.983 7.072-1.027L10 0l3.163 6.177 7.072 1.027-5.118 4.984 1.209 7.04L10 15.585z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="ml-2 font-medium">
                                    {feedback.rating}/5
                                  </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(feedback.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm">{feedback.message}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-muted rounded-md">
                        <p className="text-muted-foreground">
                          No feedback received
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {role === "admin" && (
                <TabsContent value="departments">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Managed Departments</h3>

                    <div className="p-6 text-center bg-muted rounded-md">
                      <p className="text-muted-foreground">
                        Department management information will be displayed here
                      </p>
                    </div>
                  </div>
                </TabsContent>
              )}

              {role === "admin" && (
                <TabsContent value="activity">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Recent Activity</h3>

                    <div className="p-6 text-center bg-muted rounded-md">
                      <p className="text-muted-foreground">
                        Admin activity log will be displayed here
                      </p>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserProfilePage
