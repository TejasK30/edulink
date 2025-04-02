"use client"

import {
  AlertCircle,
  BarChart2,
  Book,
  Briefcase,
  Building2,
  CalendarCheck,
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

const StudentNavItems = [
  {
    title: "Dashboard",
    url: "/student/dashboard",
    icon: BarChart2,
    isActive: true,
  },
  {
    title: "Announcements",
    url: "/student/announcements",
    icon: AlertCircle,
  },
  {
    title: "Assignments",
    url: "/student/assignments",
    icon: Book,
  },
  {
    title: "Attendance",
    url: "/student/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Courses",
    url: "/student/courses",
    icon: GraduationCap,
  },
  {
    title: "Jobs",
    url: "/student/jobs",
    icon: Briefcase,
  },
]

type Department = {
  name: string
  logo: React.ElementType
  plan: string
}

type StudentSidebarProps = React.ComponentProps<typeof Sidebar> & {
  studentId?: string
  departments?: Department[]
}

type StudentData = {
  user: {
    name: string
    email: string
    avatar: string
  }
  departments: Department[]
}

export default function StudentSidebar({
  studentId,
  departments = [],
  ...props
}: StudentSidebarProps) {
  const defaultDepartments: Department[] = React.useMemo(() => {
    return departments.length
      ? departments
      : [
          { name: "Computer Science", logo: School, plan: "Department" },
          { name: "Engineering", logo: Building2, plan: "Department" },
          { name: "Business School", logo: DollarSign, plan: "Department" },
        ]
  }, [departments])

  const [studentData, setStudentData] = useState<StudentData>({
    user: {
      name: "Student User",
      email: "student@college.edu",
      avatar: "/avatars/student.jpg",
    },
    departments: defaultDepartments,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!studentId) return
    const fetchStudentData = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/students/${studentId}`)
        const data = await res.json()
        setStudentData({
          user: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.user.email,
            avatar: "/avatars/student.jpg",
          },
          departments: departments.length ? departments : defaultDepartments,
        })
      } catch (err: unknown) {
        console.error("Failed to fetch student data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudentData()
  }, [studentId, departments, defaultDepartments])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <TeamSwitcher teams={studentData.departments} />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={StudentNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={studentData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
