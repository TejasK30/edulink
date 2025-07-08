import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AdminData, Semester } from "@/types/dashboard.types"
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from "recharts"

type Props = {
  studentCount: number
  teacherCount: number
  adminCount: number
  semesters: Semester[]
  adminInfo: AdminData
}

export const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

const OverviewTab = ({
  studentCount,
  teacherCount,
  adminCount,
  semesters,
  adminInfo,
}: Props) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getUserDistribution = () => [
    { name: "Students", value: studentCount },
    { name: "Teachers", value: teacherCount },
    { name: "Admins", value: adminCount },
  ]

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-foreground">User Distribution</CardTitle>
            <CardDescription className="text-muted-foreground">
              Breakdown of users by role across the college
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getUserDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {getUserDistribution().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                    itemStyle={{
                      color: "var(--foreground)",
                    }}
                    cursor={false}
                  />
                  <Legend className="text-foreground" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-foreground">Active Semesters</CardTitle>
            <CardDescription className="text-muted-foreground">
              Currently running academic semesters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {semesters.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active semesters found
                </p>
              ) : (
                semesters.map((semester) => (
                  <div
                    key={semester._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-foreground">
                        {semester.name} {semester.year}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(semester.startDate)} -{" "}
                        {formatDate(semester.endDate)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-foreground border-border"
                    >
                      {semester.subjects.length} Courses
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-foreground">
              College Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-foreground">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">College Name</h3>
                <p className="text-sm text-muted-foreground">
                  {adminInfo.college.name}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Address</h3>
                <p className="text-sm text-muted-foreground">
                  {adminInfo.college.address}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Total Users</h3>
                <p className="text-sm text-muted-foreground">
                  {studentCount + teacherCount + adminCount}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Administrator</h3>
                <p className="text-sm text-muted-foreground">
                  {adminInfo.name} - {adminInfo.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default OverviewTab
