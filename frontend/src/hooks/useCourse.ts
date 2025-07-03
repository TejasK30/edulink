import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import {
  Course,
  CourseFormSchemaType,
  Department,
  Semester,
  Teacher,
} from "@/types/course.types"

export const useCoursesData = (collegeId: string | undefined) => {
  return useQuery({
    queryKey: ["courses-data", collegeId],
    queryFn: async () => {
      if (!collegeId) throw new Error("College ID is required")

      const [deptRes, semRes, teacherRes, courseRes] = await Promise.all([
        api.get(`/auth/colleges/${collegeId}/departments`),
        api.get(`/admin/colleges/${collegeId}/semesters`),
        api.get("/users", { params: { role: "teacher", collegeId } }),
        api.get(`/courses/college/${collegeId}`),
      ])

      const departments: Department[] = deptRes.data
      const semesters: Semester[] = semRes.data
      const teachers: Teacher[] = teacherRes.data

      const enhancedCourses: Course[] = courseRes.data.map((course: Course) => {
        const dept = departments.find((d) => d._id === course.departmentId)
        const sem = semesters.find((s) => s._id === course.semesterId)
        const teacher = teachers.find((t) => t._id === course.teacherId)

        return {
          ...course,
          departmentName: dept?.name || "Unknown",
          semesterName: sem ? `${sem.name} ${sem.year}` : "Unknown",
          teacherName: teacher?.name || "Not Assigned",
        }
      })

      return {
        departments,
        semesters,
        teachers,
        courses: enhancedCourses,
      }
    },
    enabled: !!collegeId,
  })
}

export const useCreateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CourseFormSchemaType & { collegeId: string }) => {
      const response = await api.post("/api/courses", {
        ...data,
        credits: parseInt(data.credits),
        teacherId: data.teacherId === "abcde" ? null : data.teacherId,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses-data"] })
    },
  })
}

export const useUpdateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: CourseFormSchemaType & { collegeId: string }
    }) => {
      const response = await api.put(`/api/courses/${id}`, {
        ...data,
        credits: parseInt(data.credits),
        teacherId: data.teacherId === "abcde" ? null : data.teacherId,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses-data"] })
    },
  })
}

export const useDeleteCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/courses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses-data"] })
    },
  })
}
