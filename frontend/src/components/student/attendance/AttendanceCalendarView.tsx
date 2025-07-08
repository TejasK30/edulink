import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AttendanceRecord } from "@/types/student.types"
import { filterRecords, mapDatesByStatus } from "@/utils/student.utils"
import { useState } from "react"

interface Props {
  attendance: AttendanceRecord[]
  loading: boolean
  courseFilter: string
}

export default function AttendanceCalendarView({
  attendance,
  courseFilter,
}: Props) {
  const [month, setMonth] = useState(new Date())
  const records = filterRecords(attendance, courseFilter)
  const { presentDates, absentDates } = mapDatesByStatus(records)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>Attendance Calendar ({format(month, "MMMM yyyy")})</span>
          <div className="flex items-center space-x-4">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm">Present</span>
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-sm">Absent</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={undefined}
          month={month}
          onMonthChange={setMonth}
          className="rounded-md border p-0"
          modifiers={{
            present: presentDates,
            absent: absentDates,
          }}
          modifiersClassNames={{
            present: "bg-green-100 text-green-900 hover:bg-green-200",
            absent: "bg-red-100 text-red-900 hover:bg-red-200",
          }}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
        />
      </CardContent>
    </Card>
  )
}
