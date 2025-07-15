import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Course } from "@/lib/types"

interface CourseTableProps {
  courses: Course[]
  onView?: (course: Course) => void
  onEdit?: (course: Course) => void
}

const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  onView,
  onEdit,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Credits</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course._id}>
            <TableCell>{course.code}</TableCell>
            <TableCell>{course.name}</TableCell>
            <TableCell>{course.credits}</TableCell>
            <TableCell className="text-right">
              {onView && (
                <Button variant="ghost" onClick={() => onView(course)}>
                  View
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" onClick={() => onEdit(course)}>
                  Edit
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default CourseTable
