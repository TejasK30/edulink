"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import api from "@/lib/api"
import { Course } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import CourseTable from "@/components/course-table"
import CourseFormDialog from "@/components/course-form"

const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const { currentUser } = useAppStore()
  const collegeId = currentUser?.collegeid || ""

  const fetchCourses = async () => {
    try {
      const response = await api.get(`/courses/college/${collegeId}`)
      setCourses(response.data)
    } catch (err: unknown) {
      console.error("Error fetching courses", err)
    }
  }

  useEffect(() => {
    if (collegeId) {
      fetchCourses()
    }
  }, [collegeId])

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        const response = await api.post(`/courses`, { ...data, collegeId })
        if (response.status === 201) {
          setFormOpen(false)
          fetchCourses()
        }
      } else if (formMode === "edit" && selectedCourse) {
        const response = await api.put(`/courses/${selectedCourse._id}`, data)
        if (response.status === 200) {
          setFormOpen(false)
          fetchCourses()
        }
      }
    } catch (err: unknown) {
      console.error("Error submitting course", err)
    }
  }

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
      <Card>
        <CardContent>
          <CourseTable
            courses={filteredCourses}
            onEdit={handleEditOpen}
            onView={() => {}}
          />
        </CardContent>
      </Card>
      <CourseFormDialog
        open={formOpen}
        mode={formMode}
        initialData={selectedCourse || undefined}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

export default AdminCoursesPage
