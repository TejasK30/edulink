// src/components/student/attendance/AttendancePage.tsx
"use client"

import api from "@/lib/api"
import { useAuth } from "@/lib/providers/auth-provider"
import {
  AttendanceApiResponse,
  AttendanceRecord,
  CourseInfo,
} from "@/types/student.types"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import AttendanceFilter from "@/components/student/attendance/AttendanceFilter"
import AttendanceStats from "@/components/student/attendance/AttendanceStats"
import AttendanceTabs from "@/components/student/attendance/AttendanceTabs"
import AttendanceTrendChart from "@/components/student/attendance/AttendanceTrendChart"

export default function AttendancePage() {
  const { user } = useAuth()
  const studentId = user?.id

  const [courseFilter, setCourseFilter] = useState<string>("all")

  // 1️⃣ Fetch all attendance records
  const { data: attendance = [], isLoading: loadingAttendance } = useQuery<
    AttendanceRecord[],
    Error
  >({
    queryKey: ["attendanceRecords", studentId],
    queryFn: async () => {
      const res = await api.get<AttendanceApiResponse>(
        `/student/attendance/${studentId}`
      )
      if (!res.data.success) throw new Error(res.data.error || res.data.message)
      return res.data.data.records
    },
  })

  // 2️⃣ Derive unique courses from attendance
  const courses: CourseInfo[] = Array.from(
    new Map(
      attendance.map((r) => [
        r.courseId._id,
        { id: r.courseId._id, name: r.courseId.name, code: r.courseId.code },
      ])
    ).values()
  )

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">My Attendance</h1>

      <AttendanceStats attendance={attendance} loading={loadingAttendance} />

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <AttendanceFilter
          courses={courses}
          value={courseFilter}
          onChange={setCourseFilter}
        />
      </div>

      <AttendanceTabs
        attendance={attendance}
        loading={loadingAttendance}
        courseFilter={courseFilter}
      />

      <div className="mt-6">
        <AttendanceTrendChart
          attendance={attendance}
          courseFilter={courseFilter}
          loading={loadingAttendance}
        />
      </div>
    </div>
  )
}
