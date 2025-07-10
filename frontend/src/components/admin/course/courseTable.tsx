"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Course } from "@/types/course.types"

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
import { Edit, Trash, Search, Filter } from "lucide-react"
import { useDeleteCourse } from "@/hooks/useCourse"

interface CourseTableProps {
  courses: Course[]
  onEdit: (course: Course) => void
}

export default function CourseTable({ courses, onEdit }: CourseTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [semesterFilter, setSemesterFilter] = useState<string>("all")

  const deleteCourseMutation = useDeleteCourse()

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteCourseMutation.mutateAsync(deleteId)
      toast.success("Course deleted successfully.")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete course")
    } finally {
      setShowDeleteDialog(false)
      setDeleteId(null)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  // Filter courses based on search term and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacherName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment =
      departmentFilter === "all" || course.departmentName === departmentFilter

    const matchesSemester =
      semesterFilter === "all" || course.semesterName === semesterFilter

    return matchesSearch && matchesDepartment && matchesSemester
  })

  // Get unique departments and semesters for filters
  const uniqueDepartments = [...new Set(courses.map((c) => c.departmentName))]
  const uniqueSemesters = [...new Set(courses.map((c) => c.semesterName))]

  return (
    <>
      <Card className="w-full lg:w-2/3">
        <CardHeader>
          <CardTitle>Course List</CardTitle>
          <CardDescription>
            Manage all courses in the system ({filteredCourses.length} of{" "}
            {courses.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses, codes, or teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept!}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {uniqueSemesters.map((sem) => (
                  <SelectItem key={sem} value={sem!}>
                    {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      {courses.length === 0
                        ? "No courses found. Create your first course!"
                        : "No courses match your search criteria."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell className="font-medium">
                        {course.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.code}</Badge>
                      </TableCell>
                      <TableCell>{course.departmentName}</TableCell>
                      <TableCell>{course.semesterName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.credits}</Badge>
                      </TableCell>
                      <TableCell>
                        {course.teacherId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            {course.teacherName}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <Badge variant="secondary">Not Assigned</Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(course)}
                            className="hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(course._id)}
                            className="hover:bg-red-50 text-red-600"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course and remove it from all associated records, including
              student enrollments and attendance data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCourseMutation.isPending}
            >
              {deleteCourseMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
