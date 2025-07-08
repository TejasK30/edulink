import { AttendanceRecord } from "@/types/student.types"
import {
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns"

export function computeStats(records: AttendanceRecord[]) {
  const totalClasses = records.length
  const presentClasses = records.filter((r) => r.status === "present").length
  const pct = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0
  return {
    totalClasses,
    presentClasses,
    absentClasses: totalClasses - presentClasses,
    attendancePercentage: Math.round(pct * 100) / 100,
  }
}

export function filterRecords(
  records: AttendanceRecord[],
  courseFilter: string
) {
  return records.filter((r) =>
    courseFilter === "all" ? true : r.courseId._id === courseFilter
  )
}

export function mapDatesByStatus(records: AttendanceRecord[]) {
  const presentDates = records
    .filter((r) => r.status === "present")
    .map((r) => parseISO(r.date))
  const absentDates = records
    .filter((r) => r.status === "absent")
    .map((r) => parseISO(r.date))
  return { presentDates, absentDates }
}

export interface MonthlyTrendData {
  month: string
  fullMonth: string
  percentage: number
}

export function computeMonthlyTrend(
  records: AttendanceRecord[],
  courseFilter: string
): MonthlyTrendData[] {
  const filtered = filterRecords(records, courseFilter)
  const trend: MonthlyTrendData[] = []
  const today = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const inMonth = filtered.filter((r) =>
      isWithinInterval(parseISO(r.date), { start, end })
    )
    const pct =
      inMonth.length > 0
        ? Math.round(
            (inMonth.filter((r) => r.status === "present").length /
              inMonth.length) *
              100
          )
        : 0
    trend.push({
      month: format(start, "MMM"),
      fullMonth: format(start, "MMMM yyyy"),
      percentage: pct,
    })
  }
  return trend
}

export function getBarColor(percentage: number) {
  if (percentage >= 75) return "#22c55e"
  if (percentage >= 60) return "#facc15"
  return "#ef4444"
}
