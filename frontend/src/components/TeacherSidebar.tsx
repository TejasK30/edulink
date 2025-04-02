"use client"

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
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "./ui/sidebar"

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
    items: [{ title: "Create", url: "/teacher/jobs/create" }],
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
  teacherId?: string
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
  teacherId,
  departments = [],
  ...props
}: TeacherSidebarProps) {
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
      name: "Teacher User",
      email: "teacher@college.edu",
      avatar: "/avatars/teacher.jpg",
    },
    departments: defaultDepartments,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!teacherId) return
    const fetchTeacherData = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/staff/${teacherId}`)
        const data = await res.json()
        setTeacherData({
          user: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.user.email,
            avatar: "/avatars/teacher.jpg",
          },
          departments: departments.length ? departments : defaultDepartments,
        })
      } catch (err: unknown) {
        console.error("Failed to fetch teacher data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTeacherData()
  }, [teacherId, departments, defaultDepartments])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <TeamSwitcher teams={teacherData.departments} />
        )}
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
