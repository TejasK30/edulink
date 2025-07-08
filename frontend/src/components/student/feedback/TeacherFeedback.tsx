import { Control } from "react-hook-form"
import { TeacherSelect } from "./TeacherSelect"
import { RatingInput } from "./RatingInput"
import { CommentInput } from "./CommentInput"
import { FeedbackFormValues } from "@/types/feedback.types"

interface TeacherFieldConfig {
  name: keyof FeedbackFormValues["teacherFeedback"]
  label: string
}

interface TeacherFeedbackSectionProps {
  control: Control<FeedbackFormValues>
  getError: (fieldName: string) => string | null
  selectedTeacherId: string | null
  setSelectedTeacherId: (id: string | null) => void
  collegeId: string | undefined
  teacherRatingsGiven: boolean
}

export const TeacherFeedbackSection = ({
  control,
  getError,
  selectedTeacherId,
  setSelectedTeacherId,
  collegeId,
  teacherRatingsGiven,
}: TeacherFeedbackSectionProps) => {
  const teacherFields: TeacherFieldConfig[] = [
    { name: "clarity", label: "Clarity & Communication" },
    { name: "expertise", label: "Knowledge & Expertise" },
    { name: "engagement", label: "Engagement & Interaction" },
    { name: "punctuality", label: "Punctuality & Organization" },
    { name: "assessment", label: "Assessment & Feedback Quality" },
    { name: "subjectContent", label: "Subject Content Relevance" },
  ]

  return (
    <div className="space-y-4 p-4 border border-border/40 rounded-md">
      <h2 className="text-xl font-semibold mb-3 border-b border-border/40 pb-2">
        Teacher & Subject Feedback
      </h2>

      <TeacherSelect
        collegeId={collegeId}
        value={selectedTeacherId}
        onChange={setSelectedTeacherId}
        hasError={!selectedTeacherId && teacherRatingsGiven}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
        {teacherFields.map((field) => (
          <RatingInput
            key={field.name}
            name={`teacherFeedback.${field.name}` as const}
            label={field.label}
            control={control}
            error={getError(`teacherFeedback.${field.name}`)}
          />
        ))}

        <div className="md:col-span-2">
          <RatingInput
            name="teacherFeedback.overallTeacher"
            label="Overall Teacher Rating"
            control={control}
            error={getError("teacherFeedback.overallTeacher")}
            className="font-medium"
          />
        </div>
      </div>

      <CommentInput
        name="teacherFeedback.teacherComment"
        label="Comments about Teacher/Subject (Optional)"
        placeholder="Provide specific examples or suggestions..."
        control={control}
        error={getError("teacherFeedback.teacherComment")}
      />
    </div>
  )
}
