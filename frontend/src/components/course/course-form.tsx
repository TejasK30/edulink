import React, { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CourseFormData } from "@/lib/types"
import { courseFormDialogSchema } from "@/lib/schemas/course.schema"

interface CourseFormDialogProps {
  open: boolean
  mode: "add" | "edit" | "view"
  initialData?: CourseFormData
  onClose: () => void
  onSubmit: (data: CourseFormData) => Promise<void>
}

const CourseFormDialog: React.FC<CourseFormDialogProps> = ({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormDialogSchema),
    defaultValues: {
      _id: "",
      name: "",
      code: "",
      credits: 3,
      description: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    } else {
      form.reset({
        _id: "",
        name: "",
        code: "",
        credits: 3,
        description: "",
      })
    }
  }, [initialData, form])

  const isViewMode = mode === "view"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add"
              ? "Add New Course"
              : mode === "edit"
              ? "Edit Course"
              : "Course Details"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new course"
              : mode === "edit"
              ? "Update course details"
              : "View course information"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter course name"
                      {...field}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter course code"
                      {...field}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credits</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter credits"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter description"
                      {...field}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sm:justify-start">
              <Button type="button" variant="secondary" onClick={onClose}>
                {isViewMode ? "Close" : "Cancel"}
              </Button>
              {!isViewMode && (
                <Button type="submit">
                  {mode === "add" ? "Create" : "Save Changes"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CourseFormDialog
