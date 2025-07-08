import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import AttendanceListView from "./AttendanceList"
import { AttendanceRecord } from "@/types/student.types"
import AttendanceCalendarView from "./AttendanceCalendarView"

interface Props {
  attendance: AttendanceRecord[]
  loading: boolean
  courseFilter: string
}

export default function AttendanceTabs({
  attendance,
  loading,
  courseFilter,
}: Props) {
  return (
    <Tabs defaultValue="list" className="w-full mb-6">
      <TabsList>
        <TabsTrigger value="list">List View</TabsTrigger>
        <TabsTrigger value="calendar">Calendar View</TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        <AttendanceListView
          attendance={attendance}
          loading={loading}
          courseFilter={courseFilter}
        />
      </TabsContent>

      <TabsContent value="calendar">
        <AttendanceCalendarView
          attendance={attendance}
          loading={loading}
          courseFilter={courseFilter}
        />
      </TabsContent>
    </Tabs>
  )
}
