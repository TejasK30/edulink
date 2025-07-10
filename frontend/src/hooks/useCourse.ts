import api from "@/lib/api"
import {
  Course,
  CourseFormSchemaType,
  Department,
  Semester,
  Teacher,
} from "@/types/course.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useDepartments = (collegeId: string | undefined) => {
  return useQuery({
    queryKey: ["departments", collegeId],
    queryFn: async () => {
      const response = await api.get(`/courses/departments/${collegeId}`)
      return response.data.data as Department[]
    },
    enabled: !!collegeId,
  })
}

export const useSemesters = (collegeId: string | undefined) => {
  return useQuery({
    queryKey: ["semesters", collegeId],
    queryFn: async () => {
      const response = await api.get(`/courses/semesters/${collegeId}`)

      return response.data as Semester[]
    },
    enabled: !!collegeId,
  })
}

export const useTeachers = (collegeId: string | undefined) => {
  return useQuery({
    queryKey: ["teachers", collegeId],
    queryFn: async () => {
      const response = await api.get("/courses/users", {
        params: {
          role: "teacher",
          collegeId,
        },
      })
      console.log("hook teachers response: ", response.data)
      return response.data as Teacher[]
    },
    enabled: !!collegeId,
  })
}

export const useCourses = (collegeId: string | undefined) => {
  return useQuery({
    queryKey: ["courses", collegeId],
    queryFn: async () => {
      const response = await api.get(`/courses/college-courses/${collegeId}`)
      return response.data as Course[]
    },
    enabled: !!collegeId,
  })
}

export const useCoursesData = (collegeId: string | undefined) => {
  const departments = useDepartments(collegeId)
  const semesters = useSemesters(collegeId)
  const teachers = useTeachers(collegeId)
  const courses = useCourses(collegeId)

  return {
    departments: departments.data || [],
    semesters: semesters.data || [],
    teachers: teachers.data || [],
    courses: courses.data || [],
    isLoading:
      departments.isLoading ||
      semesters.isLoading ||
      teachers.isLoading ||
      courses.isLoading,
    error:
      departments.error || semesters.error || teachers.error || courses.error,
  }
}

export const useCreateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CourseFormSchemaType & { collegeId: string }) => {
      const { collegeId, ...rest } = data

      const response = await api.post(`/courses/create/${collegeId}`, {
        ...rest,
        credits: parseInt(data.credits),
        teacherId: data.teacherId === "abcde" ? null : data.teacherId,
      })

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
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
