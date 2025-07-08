import { Attendance } from "@/types/student.types"
import { TabsContent } from "../../ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { Progress } from "../../ui/progress"
import { EmptyState } from "./EmptyState"
import { UserCheckIcon } from "lucide-react"

export const AttendanceTab = ({ attendance }: { attendance: Attendance[] }) => (
  <TabsContent value="attendance" className="space-y-4">
    <h2 className="text-xl font-semibold">Attendance Summary</h2>
    {attendance.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2">
        {attendance.map((attendanceItem: Attendance) => (
          <Card key={attendanceItem._id}>
            <CardHeader>
              <CardTitle>{attendanceItem.courseName}</CardTitle>
              <CardDescription>{attendanceItem.courseCode}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Present:</span>
                  <span className="font-medium">
                    {attendanceItem.present} days
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Absent:</span>
                  <span className="font-medium">
                    {attendanceItem.absent} days
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>Attendance Rate:</span>
                    <span
                      className={
                        attendanceItem.attendancePercentage >= 90
                          ? "text-green-600"
                          : attendanceItem.attendancePercentage >= 75
                          ? "text-yellow-600"
                          : "text-red-600"
                      }
                    >
                      {Math.round(attendanceItem.attendancePercentage)}%
                    </span>
                  </div>
                  <Progress
                    value={attendanceItem.attendancePercentage}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={UserCheckIcon}
        title="No Attendance Data"
        description="There is no attendance data available yet."
      />
    )}
  </TabsContent>
)
