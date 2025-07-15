import { Course } from "@/lib/types"

export const fetchCourses = async (collegeId: string): Promise<Course[]> => {
  const response = await api.get(`/courses/college/${collegeId}`)
  return response.data
}
