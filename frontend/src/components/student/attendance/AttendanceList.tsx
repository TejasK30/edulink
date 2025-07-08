import { Skeleton } from "@/components/ui/skeleton"
import { AttendanceRecord } from "@/types/student.types"
import { filterRecords } from "@/utils/student.utils"
import { format, parseISO } from "date-fns"
import { CheckCircle, Clock, XCircle } from "lucide-react"

interface Props {
  attendance: AttendanceRecord[]
  loading: boolean
  courseFilter: string
}

export default function AttendanceListView({
  attendance,
  loading,
  courseFilter,
}: Props) {
  const records = filterRecords(attendance, courseFilter)

  if (loading) {
    return Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-4 py-3 border-b px-3 rounded-md"
      >
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-20 ml-auto" />
      </div>
    ))
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No attendance records found
        {courseFilter !== "all" ? " for this course" : ""}.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {records.map((r) => (
        <div
          key={r._id}
          className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b hover:bg-slate-50 dark:hover:bg-slate-800 px-3 rounded-md"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm md:text-base">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>{format(parseISO(r.date), "dd MMM yy")}</span>
            </div>
            <div className="text-sm md:text-base">
              <span className="font-medium md:hidden">Course:</span>{" "}
              {r.courseId.code} – {r.courseId.name}
            </div>
          </div>
          <div className="mt-2 md:mt-0">
            {r.status === "present" ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" /> Present
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <XCircle className="h-3 w-3 mr-1" /> Absent
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
