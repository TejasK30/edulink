import { Course } from "@/lib/types"
import api from "@/lib/api"

export const fetchCourses = async (collegeId: string): Promise<Course[]> => {
  const response = await api.get(`/courses/college-courses/${collegeId}`)
  return response.data
}
