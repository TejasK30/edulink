"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dashboardService } from "@/lib/dashboard-service"
import { useAppStore } from "@/lib/store"
import { Building, Calendar, GraduationCap, School, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface AdminDashboardData {
  adminInfo: {
    name: string
    email: string
    college: {
      id: string
      name: string
      address: string
    }
  }
  departmentStats: {
    departmentId: string
    name: string
    studentCount: number
    teacherCount: number
    courseCount: number
  }[]
  activeSemesters: {
    _id: string
    name: string
    year: number
    startDate: string
    endDate: string
    subjects: string[]
  }[]
  userCounts: {
    students: number
    teachers: number
    admins: number
  }
  recentJobPostings: {
    _id: string
    companyName: string
    applyLink: string
    jobDescription: string
    createdAt: string
  }[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export default function AdminDashboard() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAppStore()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!currentUser) {
          return
        }

        if (currentUser.role !== "admin") {
          router.push(`/${currentUser.role}/dashboard`)
          return
        }

        const response = await dashboardService.getAdminDashboard(
          currentUser?._id as string
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getUserDistribution = () => {
    if (!dashboardData) return []

    return [
      { name: "Students", value: dashboardData.userCounts.students },
      { name: "Teachers", value: dashboardData.userCounts.teachers },
      { name: "Admins", value: dashboardData.userCounts.admins },
    ]
  }

  const getDepartmentData = () => {
    if (!dashboardData) return []

    return dashboardData.departmentStats.map((dept) => ({
      name: dept.name,
      students: dept.studentCount,
      teachers: dept.teacherCount,
      courses: dept.courseCount,
    }))
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-destructive">{error}</p>
        <Button onClick={() => router.push("/login")}>Back to Login</Button>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  return (
    <div className="min-h-screen bg-background dark:bg-Neutrals/neutrals-12">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <School className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold md:text-xl text-foreground">
              {dashboardData.adminInfo.college.name} Admin Dashboard
            </h1>
          </div>
        </div>
      </header>
      <main className="container px-4 py-6 md:py-8 md:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Students
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {dashboardData.userCounts.students}
              </div>
              <p className="text-xs text-muted-foreground">
                Enrolled across all departments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Faculty
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {dashboardData.userCounts.teachers}
              </div>
              <p className="text-xs text-muted-foreground">
                Teaching staff members
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Departments
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {dashboardData.departmentStats.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Academic departments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Active Semesters
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {dashboardData.activeSemesters.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently running semesters
              </p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="overview" className="text-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="departments" className="text-foreground">
              Departments
            </TabsTrigger>
            <TabsTrigger value="job-postings" className="text-foreground">
              Job Postings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    User Distribution
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Breakdown of users by role across the college
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getUserDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {getUserDistribution().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                          itemStyle={{
                            color: "var(--foreground)",
                          }}
                          cursor={false}
                        />
                        <Legend className="text-foreground" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Active Semesters
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Currently running academic semesters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.activeSemesters.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No active semesters found
                      </p>
                    ) : (
                      dashboardData.activeSemesters.map((semester) => (
                        <div
                          key={semester._id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <h3 className="font-medium text-foreground">
                              {semester.name} {semester.year}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(semester.startDate)} -{" "}
                              {formatDate(semester.endDate)}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-foreground border-border"
                          >
                            {semester.subjects.length} Courses
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">
                  College Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium">College Name</h3>
                    <p className="text-sm text-muted-foreground">
                      {dashboardData.adminInfo.college.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Address</h3>
                    <p className="text-sm text-muted-foreground">
                      {dashboardData.adminInfo.college.address}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Total Users</h3>
                    <p className="text-sm text-muted-foreground">
                      {dashboardData.userCounts.students +
                        dashboardData.userCounts.teachers +
                        dashboardData.userCounts.admins}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Administrator</h3>
                    <p className="text-sm text-muted-foreground">
                      {dashboardData.adminInfo.name} -{" "}
                      {dashboardData.adminInfo.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">
                  Department Statistics
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Breakdown of students, teachers, and courses by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDepartmentData()}>
                      <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        className="dark:stroke-gray-300"
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        className="dark:stroke-gray-300"
                        tickFormatter={(value) =>
                          Number.isInteger(value) ? value : ""
                        }
                        domain={[0, "dataMax"]}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#22272E",
                          color: "#EDEDED",
                          border: "1px solid #4B5563",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                        itemStyle={{
                          color: "#EDEDED",
                        }}
                      />

                      <Legend />
                      <Bar
                        dataKey="students"
                        fill={COLORS[0]}
                        name="Students"
                      />
                      <Bar
                        dataKey="teachers"
                        fill={COLORS[1]}
                        name="Teachers"
                      />
                      <Bar dataKey="courses" fill={COLORS[2]} name="Courses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboardData.departmentStats.map((dept) => (
                <Card key={dept.departmentId}>
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      {dept.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-foreground">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Students</p>
                        <Badge variant="secondary">{dept.studentCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Teachers</p>
                        <Badge variant="secondary">{dept.teacherCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Courses</p>
                        <Badge variant="secondary">{dept.courseCount}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full text-foreground border-border"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="job-postings" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Recent Job Postings
              </h2>
              <Button size="sm">Add New Posting</Button>
            </div>
            <div className="grid gap-4">
              {dashboardData.recentJobPostings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No job postings available
                    </p>
                  </CardContent>
                </Card>
              ) : (
                dashboardData.recentJobPostings.map((job) => (
                  <Card key={job._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-foreground">
                          {job.companyName}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="text-foreground border-border"
                        >
                          {formatDate(job.createdAt)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="text-foreground">
                      <p className="text-sm text-muted-foreground mb-4">
                        {job.jobDescription.length > 200
                          ? `${job.jobDescription.substring(0, 200)}...`
                          : job.jobDescription}
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-foreground border-border"
                        >
                          <a
                            href={job.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Apply Link
                          </a>
                        </Button>
                        <Button size="sm" className="text-foreground">
                          Edit Posting
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
