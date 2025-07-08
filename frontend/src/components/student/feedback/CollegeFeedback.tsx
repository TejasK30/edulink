import { Control } from "react-hook-form"
import { RatingInput } from "./RatingInput"
import { CommentInput } from "./CommentInput"
import { FeedbackFormValues } from "@/types/feedback.types"

interface CollegeFieldConfig {
  name: keyof FeedbackFormValues["collegeFeedback"]
  label: string
}

interface CollegeFeedbackSectionProps {
  control: Control<FeedbackFormValues>
  getError: (fieldName: string) => string | null
}

export const CollegeFeedbackSection = ({
  control,
  getError,
}: CollegeFeedbackSectionProps) => {
  const collegeFields: CollegeFieldConfig[] = [
    { name: "facilities", label: "Facilities & Infrastructure" },
    { name: "campusLife", label: "Campus Life & Extracurriculars" },
    { name: "administration", label: "Administration & Support Services" },
    { name: "academicEnvironment", label: "Academic Environment & Resources" },
  ]

  return (
    <div className="space-y-4 p-4 border border-border/40 rounded-md">
      <h2 className="text-xl font-semibold mb-3 border-b border-border/40 pb-2">
        College/Institution Feedback
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {collegeFields.map((field) => (
          <RatingInput
            key={field.name}
            name={`collegeFeedback.${field.name}` as const}
            label={field.label}
            control={control}
            error={getError(`collegeFeedback.${field.name}`)}
          />
        ))}

        <div className="md:col-span-2">
          <RatingInput
            name="collegeFeedback.overallCollege"
            label="Overall College Rating"
            control={control}
            error={getError("collegeFeedback.overallCollege")}
            className="font-medium"
          />
        </div>
      </div>

      <CommentInput
        name="collegeFeedback.collegeComment"
        label="Comments about College/Institution (Optional)"
        placeholder="Share suggestions for improvement or positive experiences..."
        control={control}
        error={getError("collegeFeedback.collegeComment")}
      />
    </div>
  )
}
