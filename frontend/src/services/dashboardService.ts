import api from "@/lib/api"

export const dashboardService = {
  getStudentDashboard: (userId: string) => {
    return api.get(`/dashboard/student/${userId}`)
  },
  getTeacherDashboard: (userId: string) => {
    console.log(api)
    return api.get(`/dashboard/teacher/${userId}`)
  },
  getAdminDashboard: () => {
    return api.get(`/dashboard/admin`)
  },
}

export default api
