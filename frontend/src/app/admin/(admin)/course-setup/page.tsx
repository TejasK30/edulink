"use client"

import CourseForm from "@/components/admin/course/courseForm"
import CourseTable from "@/components/admin/course/courseTable"
import { useCoursesData } from "@/hooks/useCourse"
import { useAuth } from "@/lib/auth-provider"
import { Course } from "@/types/course.types"
import { useState } from "react"
import { toast } from "sonner"

export default function CoursesPage() {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const { user } = useAuth()
  const collegeId = user?.collegeId

  const { departments, semesters, teachers, courses, isLoading, error } =
    useCoursesData(collegeId)

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading courses data...</div>
      </div>
    )
  }

  if (error) {
    toast.error("Failed to load courses data.")
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-600">
          Failed to load courses data. Please try again later.
        </div>
      </div>
    )
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
  }

  const handleEditComplete = () => {
    setEditingCourse(null)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <CourseForm
          departments={departments}
          semesters={semesters}
          teachers={teachers}
          collegeId={collegeId!}
          editingCourse={editingCourse}
          onEditComplete={handleEditComplete}
        />
        <CourseTable courses={courses} onEdit={handleEdit} />
      </div>
    </div>
  )
}
