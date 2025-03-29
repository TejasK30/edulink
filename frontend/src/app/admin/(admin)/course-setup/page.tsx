"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import api from "@/lib/api"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash } from "lucide-react"
import { useAppStore } from "@/lib/store"

type Department = {
  _id: string
  name: string
}

type Semester = {
  _id: string
  name: string
  year: number
}

type Teacher = {
  _id: string
  name: string
}

type Course = {
  _id: string
  name: string
  code: string
  credits: number
  description: string
  departmentId: string
  semesterId: string
  teacherId?: string
  departmentName?: string
  semesterName?: string
  teacherName?: string
}

const courseFormSchema = z.object({
  name: z.string().min(2, {
    message: "Course name must be at least 2 characters.",
  }),
  code: z.string().min(2, {
    message: "Course code must be at least 2 characters.",
  }),
  credits: z
    .string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "Credits must be a positive number.",
    }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  departmentId: z.string().min(1, {
    message: "Please select a department.",
  }),
  semesterId: z.string().min(1, {
    message: "Please select a semester.",
  }),
  teacherId: z.string().nullable().optional(),
})

export default function CoursesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { currentUser } = useAppStore()
  const collegeId = currentUser?.collegeid

  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      code: "",
      credits: "3",
      description: "",
      departmentId: "",
      semesterId: "",
      teacherId: null,
    },
  })

  useEffect(() => {
    if (!collegeId) {
      toast("College ID is missing.")
      return
    }
    const fetchData = async () => {
      try {
        const [deptRes, semRes, teacherRes, courseRes] = await Promise.all([
          api.get(`/auth/colleges/${collegeId}/departments`),
          api.get(`/admin/colleges/${collegeId}/semesters`),
          api.get("/users", { params: { role: "teacher", collegeId } }),
          api.get(`/courses/college/${collegeId}`),
        ])

        setDepartments(deptRes.data)
        setSemesters(semRes.data)
        setTeachers(teacherRes.data)

        const enhancedCourses = courseRes.data.map((course: Course) => {
          const dept = deptRes.data.find(
            (d: Department) => d._id === course.departmentId
          )
          const sem = semRes.data.find(
            (s: Semester) => s._id === course.semesterId
          )
          const teacher = teacherRes.data.find(
            (t: Teacher) => t._id === course.teacherId
          )
          return {
            ...course,
            departmentName: dept?.name || "Unknown",
            semesterName: sem ? `${sem.name} ${sem.year}` : "Unknown",
            teacherName: teacher?.name || "Not Assigned",
          }
        })

        setCourses(enhancedCourses)
      } catch (error: any) {
        toast("Failed to load data. Please try again later.")
      }
    }
    fetchData()
  }, [collegeId])

  const handleEdit = (course: Course) => {
    form.reset({
      name: course.name,
      code: course.code,
      credits: course.credits.toString(),
      description: course.description,
      departmentId: course.departmentId,
      semesterId: course.semesterId,
      teacherId: course.teacherId || null,
    })
    setIsEditing(true)
    setEditId(course._id)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/api/courses/${deleteId}`)
      setCourses(courses.filter((course) => course._id !== deleteId))
      toast("Course deleted successfully.")
    } catch (error: any) {
      toast(error.response?.data?.message || "Failed to delete course")
    } finally {
      setShowDeleteDialog(false)
      setDeleteId(null)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  const cancelForm = () => {
    form.reset()
    setIsEditing(false)
    setEditId(null)
  }

  async function onSubmit(values: z.infer<typeof courseFormSchema>) {
    try {
      setIsLoading(true)
      const teacherId = values.teacherId === "abcde" ? null : values.teacherId
      const dataToSend = {
        ...values,
        credits: parseInt(values.credits),
        teacherId,
        collegeId: collegeId || "0",
      }

      let response
      if (isEditing && editId) {
        response = await api.put(`/api/courses/${editId}`, dataToSend)
        toast("Course updated successfully.")
        const updatedCourse = response.data
        const dept = departments.find(
          (d) => d._id === updatedCourse.departmentId
        )
        const sem = semesters.find((s) => s._id === updatedCourse.semesterId)
        const teacher = teachers.find((t) => t._id === updatedCourse.teacherId)
        setCourses(
          courses.map((course) =>
            course._id === editId
              ? {
                  ...updatedCourse,
                  departmentName: dept?.name || "Unknown",
                  semesterName: sem ? `${sem.name} ${sem.year}` : "Unknown",
                  teacherName: teacher?.name || "Not Assigned",
                }
              : course
          )
        )
      } else {
        response = await api.post("/api/courses", dataToSend)
        toast("Course created successfully.")
        const newCourse = response.data
        const dept = departments.find((d) => d._id === newCourse.departmentId)
        const sem = semesters.find((s) => s._id === newCourse.semesterId)
        const teacher = teachers.find((t) => t._id === newCourse.teacherId)
        setCourses([
          ...courses,
          {
            ...newCourse,
            departmentName: dept?.name || "Unknown",
            semesterName: sem ? `${sem.name} ${sem.year}` : "Unknown",
            teacherName: teacher?.name || "Not Assigned",
          },
        ])
      }
      form.reset()
      setIsEditing(false)
      setEditId(null)
    } catch (error: any) {
      toast(
        error.response?.data?.message ||
          (isEditing ? "Failed to update course" : "Failed to create course")
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="w-full lg:w-1/3">
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Course" : "Add New Course"}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Update the course details below."
                : "Fill in the details to create a new course."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                        <Textarea
                          placeholder="Course description..."
                          {...field}
                        />
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                          <SelectItem value={"abcde"}>Not Assigned</SelectItem>
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelForm}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="w-full lg:w-2/3">
          <CardHeader>
            <CardTitle>Course List</CardTitle>
            <CardDescription>Manage all courses in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>A list of all courses</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No courses found. Create your first course!
                      </TableCell>
                    </TableRow>
                  ) : (
                    courses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell className="font-medium">
                          {course.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.code}</Badge>
                        </TableCell>
                        <TableCell>{course.departmentName}</TableCell>
                        <TableCell>{course.semesterName}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          {course.teacherId ? (
                            course.teacherName
                          ) : (
                            <Badge variant="secondary">Not Assigned</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(course._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course and remove it from all associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
