"use client"

import { useAuth } from "@/lib/providers/auth-provider"
import {
  AlertCircle,
  BarChart2,
  Book,
  Briefcase,
  Building2,
  Check,
  DollarSign,
  GraduationCap,
  School,
} from "lucide-react"
import React, { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "../ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"

const TeacherNavItems = [
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
    icon: Book,
    items: [
      { title: "Create", url: "/teacher/assignments/create" },
      { title: "List", url: "/teacher/assignments/list" },
    ],
  },
  {
    title: "Attendance",
    icon: Check,
    items: [{ title: "Create", url: "/teacher/attendance/create" }],
  },
  {
    title: "Course",
    url: "/teacher/course",
    icon: GraduationCap,
  },
  {
    title: "Grading",
    url: "/teacher/grade",
    icon: GraduationCap,
  },
  {
    title: "Jobs",
    icon: Briefcase,
    items: [
      { title: "Create", url: "/teacher/jobs/create" },
      { title: "List", url: "/teacher/jobs/list" },
    ],
  },
  {
    title: "Academics",
    url: "/teacher/academics",
    icon: Book,
  },
]

type Department = {
  name: string
  logo: React.ElementType
  plan: string
}

type TeacherSidebarProps = React.ComponentProps<typeof Sidebar> & {
  departments?: Department[]
}

type TeacherData = {
  user: {
    name: string
    email: string
    avatar: string
  }
  departments: Department[]
}

export default function TeacherSidebar({
  departments = [],
  ...props
}: TeacherSidebarProps) {
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

  const [teacherData, setTeacherData] = useState<TeacherData>({
    user: {
      name: (currentUser?.name as string) || "Teacher User",
      email: (currentUser?.email as string) || "teacher",
      avatar: "/avatars/admin.jpg",
    },

    departments: defaultDepartments,
  })

  useEffect(() => {
    if (!currentUser) {
      return
    }
    setTeacherData({
      user: {
        name: currentUser?.name as string,
        email: currentUser?.email as string,
        avatar: `/avatars/${currentUser.role}.jpg`,
      },
      departments: defaultDepartments,
    })
  }, [currentUser])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teacherData.departments} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={TeacherNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={teacherData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
