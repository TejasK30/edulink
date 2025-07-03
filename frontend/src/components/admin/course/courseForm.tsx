"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Department,
  Semester,
  Teacher,
  Course,
  CourseFormSchemaType,
} from "@/types/course.types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { courseFormSchema } from "@/lib/schemas/course.schema"
import { useCreateCourse, useUpdateCourse } from "@/hooks/useCourse"

interface CourseFormProps {
  departments: Department[]
  semesters: Semester[]
  teachers: Teacher[]
  collegeId: string
  editingCourse?: Course | null
  onEditComplete?: () => void
}

export default function CourseForm({
  departments,
  semesters,
  teachers,
  collegeId,
  editingCourse,
  onEditComplete,
}: CourseFormProps) {
  const createCourseMutation = useCreateCourse()
  const updateCourseMutation = useUpdateCourse()

  const form = useForm<CourseFormSchemaType>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: editingCourse?.name || "",
      code: editingCourse?.code || "",
      credits: editingCourse?.credits?.toString() || "3",
      description: editingCourse?.description || "",
      departmentId: editingCourse?.departmentId || "",
      semesterId: editingCourse?.semesterId || "",
      teacherId: editingCourse?.teacherId || null,
    },
  })

  const isEditing = !!editingCourse
  const isLoading =
    createCourseMutation.isPending || updateCourseMutation.isPending

  const onSubmit = async (values: CourseFormSchemaType) => {
    try {
      const dataToSend = {
        ...values,
        collegeId,
      }

      if (isEditing && editingCourse) {
        await updateCourseMutation.mutateAsync({
          id: editingCourse._id,
          data: dataToSend,
        })
        toast.success("Course updated successfully.")
      } else {
        await createCourseMutation.mutateAsync(dataToSend)
        toast.success("Course created successfully.")
      }

      form.reset()
      onEditComplete?.()
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          (isEditing ? "Failed to update course" : "Failed to create course")
      )
    }
  }

  const handleCancel = () => {
    form.reset()
    onEditComplete?.()
  }

  return (
    <Card className="w-full lg:w-1/3">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Course" : "Add New Course"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the course details below."
            : "Fill in the details to create a new course."}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                      placeholder="Introduction to Programming"
                      {...field}
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
                    <Input placeholder="CS101" {...field} />
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
                    <Input type="number" min="1" {...field} />
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
                    <Textarea placeholder="Course description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="semesterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a semester" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem._id} value={sem._id}>
                          {sem.name} {sem.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="abcde">Not Assigned</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher._id} value={teacher._id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    You can assign a teacher now or later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Processing..."
                  : isEditing
                  ? "Update Course"
                  : "Create Course"}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
