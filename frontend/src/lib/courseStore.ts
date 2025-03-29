import { create } from "zustand"
import api from "@/lib/api"

export interface Topic {
  _id: string
  title: string
  description: string
}

export interface ICourse {
  _id: string
  collegeId: string
  departmentId: string
  semesterId: string
  teacherId?: string
  name: string
  code: string
  credits: number
  description?: string
  topics: Topic[]
  enrolledStudents: string[]
  capacity?: number
  createdAt?: Date
  updatedAt?: Date
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

interface CourseState {
  courses: ICourse[]
  loading: boolean
  error: string | null
  selectedCourse: ICourse | null
  fetchCourses: (query?: Record<string, any>) => Promise<void>
  fetchCourseById: (id: string) => Promise<void>
  createCourse: (
    courseData: Omit<ICourse, "_id" | "createdAt" | "updatedAt">
  ) => Promise<ICourse | null>
  updateCourse: (
    id: string,
    courseData: Partial<ICourse>
  ) => Promise<ICourse | null>
  deleteCourse: (id: string) => Promise<void>
  addTopic: (
    courseId: string,
    topicData: Omit<Topic, "_id">
  ) => Promise<ICourse | null>
  updateTopic: (
    courseId: string,
    topicId: string,
    topicData: Partial<Topic>
  ) => Promise<ICourse | null>
  deleteTopic: (courseId: string, topicId: string) => Promise<ICourse | null>
  setSelectedCourse: (course: ICourse | null) => void
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  loading: false,
  error: null,
  selectedCourse: null,
  fetchCourses: async (query) => {
    set({ loading: true, error: null })
    try {
      const queryString = query ? new URLSearchParams(query).toString() : ""
      const res = await api.get<ICourse[]>(
        `/courses${queryString ? `?${queryString}` : ""}`
      )
      set({ courses: res.data, loading: false })
    } catch (error: any) {
      const err = error as ApiErrorResponse
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred",
        loading: false,
      })
    }
  },
  fetchCourseById: async (id) => {
    set({ loading: true, error: null, selectedCourse: null })
    try {
      const res = await api.get<ICourse>(`/courses/${id}`)
      set({ selectedCourse: res.data, loading: false })
    } catch (error: any) {
      const err = error as ApiErrorResponse
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred",
        loading: false,
      })
    }
  },
  createCourse: async (courseData) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post<ICourse>("/courses", courseData)
      set((state) => ({
        courses: [...state.courses, res.data],
        loading: false,
      }))
      return res.data
    } catch (error: any) {
      const err = error as ApiErrorResponse
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to create course",
        loading: false,
      })
      return null
    }
  },
  updateCourse: async (id, courseData) => {
    set({ loading: true, error: null })
    try {
      const res = await api.put<ICourse>(`/courses/${id}`, courseData)
      set((state) => ({
        courses: state.courses.map((course) =>
          course._id === id ? res.data : course
        ),
        loading: false,
      }))
      return res.data
    } catch (error: any) {
      const err = error as ApiErrorResponse
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to update course",
        loading: false,
      })
      return null
    }
  },
  deleteCourse: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/courses/${id}`)
      set((state) => ({
        courses: state.courses.filter((course) => course._id !== id),
        loading: false,
      }))
    } catch (error: any) {
      const err = error as ApiErrorResponse
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete course",
        loading: false,
      })
    }
  },
  addTopic: async (courseId, topicData) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post<ICourse>(
        `/courses/${courseId}/topics`,
        topicData
      )
      set((state) => ({
        courses: state.courses.map((course) =>
          course._id === courseId ? res.data : course
        ),
        loading: false,
      }))
      return res.data
    } catch (error: any) {
      const err = error as ApiErrorResponse
      set({
        error:
          err.response?.data?.message || err.message || "Failed to add topic",
        loading: false,
      })
      return null
    }
  },
  updateTopic: async (courseId, topicId, topicData) => {
    set({ loading: true, error: null })
    try {
      const res = await api.put<ICourse>(
        `/courses/${courseId}/topics/${topicId}`,
        topicData
      )
      set((state) => ({
        courses: state.courses.map((course) => {
          if (course._id === courseId) {
            return {
              ...course,
              topics: course.topics.map((topic) =>
                topic._id === topicId ? { ...topic, ...topicData } : topic
              ),
            }
          }
          return course
        }),
        loading: false,
      }))
      return res.data
    } catch (error: any) {
      const err = error as ApiErrorResponse
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to update topic",
        loading: false,
      })
      return null
    }
  },
  deleteTopic: async (courseId, topicId) => {
    set({ loading: true, error: null })
    try {
      const res = await api.delete<ICourse>(
        `/courses/${courseId}/topics/${topicId}`
      )
      set((state) => ({
        courses: state.courses.map((course) => {
          if (course._id === courseId) {
            return {
              ...course,
              topics: course.topics.filter((topic) => topic._id !== topicId),
            }
          }
          return course
        }),
        loading: false,
      }))
      return res.data
    } catch (error: any) {
      const err = error as ApiErrorResponse
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete topic",
        loading: false,
      })
      return null
    }
  },
  setSelectedCourse: (course) => set({ selectedCourse: course }),
}))
