import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form"
import { FeedbackFormValues } from "@/types/feedback.types"

interface RatingInputProps<T extends FieldValues = FeedbackFormValues> {
  name: FieldPath<T>
  label: string
  control: Control<T>
  error?: string | null
  className?: string
}

export const RatingInput = <T extends FieldValues = FeedbackFormValues>({
  name,
  label,
  control,
  error,
  className,
}: RatingInputProps<T>) => {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            type="number"
            min={1}
            max={5}
            id={name}
            placeholder="1-5"
            {...field}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value
              field.onChange(value ? parseInt(value, 10) : undefined)
            }}
            className={cn(error && "border-destructive", className)}
          />
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
