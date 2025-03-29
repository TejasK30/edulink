"use client"

import {
  AlertCircle,
  BarChart2,
  Briefcase,
  Building2,
  DollarSign,
  NotebookPen,
  School,
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "./ui/sidebar"

const teacherNavItems = [
  {
    title: "Dashboard",
    url: "/teacher/dashboard",
    icon: BarChart2,
    isActive: true,
  },
  {
    title: "Announcements",
    icon: AlertCircle,
    items: [
      { title: "Create", url: "/teacher/announcements/create" },
      { title: "Get", url: "/teacher/announcements/get" },
    ],
  },
  {
    title: "Assignments",
    icon: NotebookPen,
    items: [
      { title: "Create Assignment", url: "/teacher/assignments/create" },
      { title: "Get Assignments", url: "/teacher/assignments/get" },
    ],
  },
  {
    title: "Assignments",
    icon: NotebookPen,
    items: [
      { title: "Create Assignment", url: "/teacher/assignments/create" },
      { title: "Get Assignments", url: "/teacher/assignments/get" },
    ],
  },
  {
    title: "Jobs",
    icon: Briefcase,
    items: [{ title: "Create Job", url: "/teacher/jobs/create" }],
  },
]

type Department = {
  name: string
  logo: React.ElementType
  plan: string
}

type AdminSidebarProps = React.ComponentProps<typeof Sidebar> & {
  adminId?: string
  departments?: Department[]
}

type AdminData = {
  user: {
    name: string
    email: string
    avatar: string
  }
  departments: Department[]
}

export default function TeacherSidebar({
  adminId,
  departments = [],
  ...props
}: AdminSidebarProps) {
  const defaultDepartments: Department[] = React.useMemo(() => {
    return departments.length
      ? departments
      : [
          { name: "Computer Science", logo: School, plan: "Department" },
          { name: "Engineering", logo: Building2, plan: "Department" },
          { name: "Business School", logo: DollarSign, plan: "Department" },
        ]
  }, [departments])

  const [adminData, setAdminData] = useState<AdminData>({
    user: {
      name: "Admin User",
      email: "admin@college.edu",
      avatar: "/avatars/admin.jpg",
    },
    departments: defaultDepartments,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!adminId) return
    const fetchAdminData = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/staff/${adminId}`)
        const data = await res.json()
        setAdminData({
          user: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.user.email,
            avatar: "/avatars/admin.jpg",
          },
          departments: departments.length ? departments : defaultDepartments,
        })
      } catch (err: unknown) {
        console.error("Failed to fetch admin data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAdminData()
  }, [adminId, departments, defaultDepartments])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <TeamSwitcher teams={adminData.departments} />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={teacherNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={adminData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
