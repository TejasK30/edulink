"use client"

import React, { useState } from "react"
import CourseFormDialog from "@/components/course/course-form"
import CourseTable from "@/components/course/course-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { useAuth } from "@/lib/providers/auth-provider"
import { Course } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { fetchCourses } from "@/services/courseService"

const AdminCoursesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [viewedCourse, setViewedCourse] = useState<Course | null>(null)

  const { user, isLoading: authLoading } = useAuth()

  const {
    data: courses = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Course[]>({
    queryKey: ["courses", user?.collegeId],
    queryFn: () => fetchCourses(user!.collegeId),
    enabled: !!user?.collegeId,
  })

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleView = (course: Course) => {
    setViewedCourse(course)
  }

  const handleAddOpen = () => {
    setFormMode("add")
    setSelectedCourse(null)
    setFormOpen(true)
  }

  const handleEditOpen = (course: Course) => {
    setFormMode("edit")
    setSelectedCourse(course)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: Partial<Course>) => {
    try {
      if (formMode === "add") {
        const response = await api.post(
          `/courses/create/${user?.collegeId}`,
          data
        )
        if (response.status === 201) {
          toast("Course Added successfully!")
          setFormOpen(false)
          refetch()
        }
      } else if (formMode === "edit" && selectedCourse) {
        const response = await api.put(`/courses/${selectedCourse._id}`, data)
        if (response.status === 200) {
          toast("Course edited successfully!")
          setFormOpen(false)
          refetch()
        }
      }
    } catch (err) {
      console.error("Error submitting course", err)
    }
  }

  const handleViewClose = () => {
    setViewedCourse(null)
  }

  if (authLoading) return <p>Loading user...</p>
  if (!user?.collegeId) return <p>User not authorized</p>

  return (
    <div className="container mx-auto p-4 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="relative w-full md:w-1/2">
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:text-white"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-300" />
          </div>
        </div>
        <Button onClick={handleAddOpen} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {isLoading ? (
        <p>Loading courses...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load courses.</p>
      ) : (
        <Card>
          <CardContent>
            <CourseTable
              courses={filteredCourses}
              onEdit={handleEditOpen}
              onView={handleView}
            />
          </CardContent>
        </Card>
      )}

      <CourseFormDialog
        open={formOpen}
        mode={formMode}
        initialData={selectedCourse || undefined}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {viewedCourse && (
        <CourseFormDialog
          open={!!viewedCourse}
          mode="view"
          initialData={viewedCourse}
          onClose={handleViewClose}
          onSubmit={async () => {}} // No-op
        />
      )}
    </div>
  )
}

export default AdminCoursesPage
