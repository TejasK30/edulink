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
} from "../ui/sidebar"
import { useAuth } from "@/lib/providers/auth-provider"

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
  departments = [],
  ...props
}: AdminSidebarProps) {
  const { user: currentUser } = useAuth()

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
      name: "",
      email: "",
      avatar: "/avatars/admin.jpg",
    },
    departments: defaultDepartments,
  })

  useEffect(() => {
    if (!currentUser) return
    setAdminData({
      user: {
        name: currentUser?.name ?? "Admin User",
        email: currentUser?.email ?? "admin",
        avatar: `/avatars/${currentUser?.role ?? "admin"}.jpg`,
      },
      departments: defaultDepartments,
    })
  }, [currentUser])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={adminData.departments} />
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
