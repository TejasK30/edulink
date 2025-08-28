"use client"

import {
  AlertCircle,
  BarChart2,
  Book,
  Briefcase,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  MessageSquareQuote,
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter } from "../ui/sidebar"
import { useAuth } from "@/lib/providers/auth-provider"

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
    title: "Feedback",
    url: "/student/feedback",
    icon: MessageSquareQuote,
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
}

export default function StudentSidebar({ ...props }: StudentSidebarProps) {
  const { user: currentUser } = useAuth()

  const [studentData, setStudentData] = useState<StudentData>({
    user: {
      name: "",
      email: "",
      avatar: "",
    },
  })

  useEffect(() => {
    if (!currentUser) {
      return
    }
    setStudentData({
      user: {
        name: (currentUser?.name as string) || "Student User",
        email: (currentUser?.email as string) || "student",
        avatar: `/avatars/${currentUser.role}.jpg`,
      },
    })
  }, [currentUser])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={StudentNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={studentData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
