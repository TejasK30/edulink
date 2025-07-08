import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts"
// import { computeMonthlyTrend, getBarColor } from "./utils"
import { AttendanceRecord } from "@/types/student.types"
import { computeMonthlyTrend, getBarColor } from "@/utils/student.utils"

interface Props {
  attendance: AttendanceRecord[]
  courseFilter: string
  loading: boolean
}

export default function AttendanceTrendChart({
  attendance,
  courseFilter,
  loading,
}: Props) {
  const trend = computeMonthlyTrend(attendance, courseFilter)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Monthly Attendance Trend (
          {courseFilter === "all" ? "All Courses" : courseFilter})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-60 w-full" />
        ) : trend.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-muted-foreground">
            No attendance in the past months
            {courseFilter !== "all" ? " for this course" : ""}.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={trend}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) =>
                  active && payload && payload[0] ? (
                    <div className="bg-background border rounded-md shadow-lg p-2 text-sm">
                      <p className="font-bold">
                        {payload[0].payload.fullMonth}
                      </p>
                      <p style={{ color: getBarColor(payload?.[0]?.value) }}>
                        Attendance: {payload[0].value}%
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                {trend.map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry.percentage)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
