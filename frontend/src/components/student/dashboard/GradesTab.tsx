import { Grade } from "@/types/student.types"
import { TabsContent } from "../../ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table"
import { Badge } from "../../ui/badge"
import { Progress } from "../../ui/progress"
import { EmptyState } from "./EmptyState"
import { GraduationCapIcon } from "lucide-react"

export const GradesTab = ({ grades }: { grades: Grade[] }) => (
  <TabsContent value="grades" className="space-y-4">
    <h2 className="text-xl font-semibold">Recent Grades</h2>
    {grades.length > 0 ? (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grades.map((grade: Grade) => (
            <TableRow key={grade._id}>
              <TableCell className="font-medium">
                {grade.courseId.name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {grade.gradeType}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      grade.gradeValue >= 9
                        ? "text-green-600"
                        : grade.gradeValue >= 8
                        ? "text-blue-600"
                        : grade.gradeValue >= 7
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {grade.gradeValue} / 10
                  </span>
                  <Progress
                    value={(grade.gradeValue / 10) * 100}
                    className="h-2 w-16"
                  />
                </div>
              </TableCell>
              <TableCell>
                {new Date(grade.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <EmptyState
        icon={GraduationCapIcon}
        title="No Recent Grades"
        description="You don't have any recent grade entries."
      />
    )}
  </TabsContent>
)
