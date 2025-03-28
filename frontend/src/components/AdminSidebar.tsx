"use client"

import {
  AlertCircle,
  BarChart2,
  Briefcase,
  Building2,
  DollarSign,
  School,
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
      { title: "Student", url: "/admin/users/students" },
      { title: "Teacher", url: "/admin/users/teacher" },
    ],
  },
  {
    title: "Jobs",
    icon: Briefcase,
    items: [{ title: "Create Job", url: "/admin/jobs/create" }],
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
          // Use the passed departments if provided; otherwise, fall back to defaults.
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
