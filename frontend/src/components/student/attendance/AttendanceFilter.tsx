import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { CourseInfo } from "@/types/student.types"

interface Props {
  courses: CourseInfo[]
  value: string
  onChange: (val: string) => void
}

export default function AttendanceFilter({ courses, value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full md:w-auto">
        <SelectValue placeholder="Filter by course" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Courses</SelectItem>
        {courses.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.code} – {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
