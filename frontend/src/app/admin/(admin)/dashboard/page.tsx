"use client"

import StatsCards from "@/components/admin/dashboard/DashboardCard"
import DepartmentsTab from "@/components/admin/dashboard/DepartmentsTab"
import Header from "@/components/admin/Header"
import JobPostings from "@/components/admin/JobPostings"
import OverviewTab from "@/components/admin/dashboard/OverviewTab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dashboardService } from "@/services/dashboardService"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminDashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { data: dashboardData } = useQuery({
    queryKey: ["get-admin-dashboard-data"],
    queryFn: async () => {
      try {
        const response = await dashboardService.getAdminDashboard()
        return response.data
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
  })

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

  return (
    <div className="min-h-screen bg-background dark:bg-Neutrals/neutrals-12">
      <Header college={dashboardData.adminInfo.college} />
      <main className="container px-4 py-6 md:py-8 md:px-6">
        <StatsCards
          counts={dashboardData.userCounts}
          deptCount={dashboardData.departmentStats.length}
          semCount={dashboardData.activeSemesters.length}
        />
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
            <OverviewTab
              adminCount={dashboardData.userCounts.admins}
              studentCount={dashboardData.userCounts.students}
              teacherCount={dashboardData.userCounts.teachers}
              adminInfo={dashboardData.adminInfo}
              semesters={dashboardData.activeSemesters}
            />
          </TabsContent>
          <TabsContent value="departments" className="space-y-4">
            <DepartmentsTab stats={dashboardData.departmentStats} />
          </TabsContent>
          <TabsContent value="job-postings" className="space-y-4">
            <JobPostings postings={dashboardData.recentJobPostings} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
