import { Building, Calendar, GraduationCap, Users } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type Counts = {
  students: number
  teachers: number
  admins: number
}

type Props = {
  counts: Counts
  deptCount: number
  semCount: number
}

export default function StatsCards({ counts, deptCount, semCount }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.students}</div>
          <p className="text-xs text-muted-foreground">
            Enrolled across all departments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.teachers}</div>
          <p className="text-xs text-muted-foreground">
            Teaching staff members
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Departments</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deptCount}</div>
          <p className="text-xs text-muted-foreground">Academic departments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Active Semesters
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{semCount}</div>
          <p className="text-xs text-muted-foreground">
            Currently running semesters
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
