"use client"

import {
  AlertCircle,
  BarChart2,
  Book,
  Briefcase,
  Building2,
  DollarSign,
  School,
  Settings,
  User,
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
import { useAppStore } from "@/lib/store"

const AdminNavItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: BarChart2,
    isActive: true,
  },
  {
    title: "Announcements",
    icon: AlertCircle,
    items: [
      { title: "Create", url: "/admin/announcements/create" },
      { title: "Get", url: "/admin/announcements/get" },
    ],
  },
  {
    title: "Users",
    icon: User,
    items: [
      { title: "Admin", url: "/admin/users/admin" },
      { title: "Students", url: "/admin/users/students" },
      { title: "Teacher", url: "/admin/users/teacher" },
    ],
  },
  {
    title: "Jobs",
    icon: Briefcase,
    items: [
      { title: "Create", url: "/admin/jobs/create" },
      { title: "List", url: "/admin/jobs/list" },
    ],
  },
  {
    title: "Academics",
    icon: Book,
    items: [{ title: "Course List", url: "/admin/academics/course-list" }],
  },
  {
    title: "Finances",
    icon: DollarSign,
    items: [{ title: "All Fees", url: "/admin/finances" }],
  },
  {
    title: "Feedback",
    icon: AlertCircle,
    items: [{ title: "Feedback Analytics", url: "/admin/feedback-analytics" }],
  },
  {
    title: "Setup",
    icon: Settings,
    items: [
      { title: "Course Setup", url: "/admin/course-setup" },
      { title: "Semester Setup", url: "/admin/semester-setup" },
    ],
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

export default function AdminSidebar({
  adminId,
  departments = [],
  ...props
}: AdminSidebarProps) {
  const { currentUser } = useAppStore()
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
      name: currentUser?.name as string,
      email: currentUser?.email as string,
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
        <NavMain items={AdminNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={adminData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
