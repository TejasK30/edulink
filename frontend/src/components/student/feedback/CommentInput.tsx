import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form"
import { FeedbackFormValues } from "@/types/feedback.types"

interface CommentInputProps<T extends FieldValues = FeedbackFormValues> {
  name: FieldPath<T>
  label: string
  placeholder: string
  control: Control<T>
  error?: string | null
  rows?: number
}

export const CommentInput = <T extends FieldValues = FeedbackFormValues>({
  name,
  label,
  placeholder,
  control,
  error,
  rows = 3,
}: CommentInputProps<T>) => {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            id={name}
            placeholder={placeholder}
            rows={rows}
            {...field}
          />
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
