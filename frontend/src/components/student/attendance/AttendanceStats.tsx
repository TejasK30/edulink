import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, CheckCircle, Activity } from "lucide-react"
import { AttendanceRecord } from "@/types/student.types"
import { computeStats } from "@/utils/student.utils"

interface Props {
  attendance: AttendanceRecord[]
  loading: boolean
}

export default function AttendanceStats({ attendance, loading }: Props) {
  const stats = computeStats(attendance)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {[
        { label: "Total Classes", icon: BookOpen, value: stats.totalClasses },
        {
          label: "Classes Attended",
          icon: CheckCircle,
          value: stats.presentClasses,
        },
        {
          label: "Attendance Rate",
          icon: Activity,
          value: `${stats.attendancePercentage}%`,
        },
      ].map(({ label, icon: Icon, value }) => (
        <Card key={label}>
          <CardContent className="flex flex-col items-center pt-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4 flex items-center justify-center">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <p className="text-3xl font-bold">{value}</p>
            )}
            <p className="text-sm text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
