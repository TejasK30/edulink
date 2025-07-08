import { COLORS } from "@/components/admin/dashboard/OverviewTab"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Department } from "@/types/dashboard.types"
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Props = {
  stats: Department[]
}

const DepartmentsTab = ({ stats }: Props) => {
  const getDepartmentData = () => {
    return stats.map((dept: Department) => ({
      name: dept.name,
      students: dept.studentCount,
      teachers: dept.teacherCount,
      courses: dept.courseCount,
    }))
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            Department Statistics
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Breakdown of students, teachers, and courses by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDepartmentData()}>
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  className="dark:stroke-gray-300"
                />
                <YAxis
                  stroke="#9CA3AF"
                  className="dark:stroke-gray-300"
                  tickFormatter={(value) =>
                    Number.isInteger(value) ? value : ""
                  }
                  domain={[0, "dataMax"]}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#22272E",
                    color: "#EDEDED",
                    border: "1px solid #4B5563",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                  itemStyle={{
                    color: "#EDEDED",
                  }}
                />

                <Legend />
                <Bar dataKey="students" fill={COLORS[0]} name="Students" />
                <Bar dataKey="teachers" fill={COLORS[1]} name="Teachers" />
                <Bar dataKey="courses" fill={COLORS[2]} name="Courses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((dept: Department) => (
          <Card key={dept.departmentId}>
            <CardHeader>
              <CardTitle className="text-foreground">{dept.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-foreground">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Students</p>
                  <Badge variant="secondary">{dept.studentCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Teachers</p>
                  <Badge variant="secondary">{dept.teacherCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Courses</p>
                  <Badge variant="secondary">{dept.courseCount}</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full text-foreground border-border"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

export default DepartmentsTab
