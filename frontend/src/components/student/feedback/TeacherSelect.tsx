import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useTeachers } from "@/hooks/useFeedback"
import { Teacher } from "@/types/feedback.types"

interface TeacherSelectProps {
  collegeId: string | undefined
  value: string | null
  onChange: (value: string | null) => void
  hasError: boolean
}

export const TeacherSelect = ({
  collegeId,
  value,
  onChange,
  hasError,
}: TeacherSelectProps) => {
  const { data: teachers = [], isLoading } = useTeachers(collegeId)

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="teacherSelect">Select Teacher</Label>
      <Select
        value={value ?? ""}
        onValueChange={(val: string) => onChange(val || null)}
        disabled={isLoading || teachers.length === 0}
      >
        <SelectTrigger
          id="teacherSelect"
          className={cn(hasError && "border-destructive")}
        >
          <SelectValue
            placeholder={
              isLoading ? "Loading teachers..." : "Select the teacher"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {teachers.length > 0 ? (
            teachers.map((teacher: Teacher) => (
              <SelectItem key={teacher._id} value={teacher._id}>
                {teacher.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-teachers" disabled>
              {isLoading ? "Loading..." : "No teachers found"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {hasError && (
        <p className="text-xs text-destructive">
          Please select a teacher for this feedback.
        </p>
      )}
    </div>
  )
}
