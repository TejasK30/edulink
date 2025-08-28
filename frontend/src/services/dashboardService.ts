import api from "@/lib/api"

export const dashboardService = {
  getStudentDashboard: () => {
    return api.get(`/dashboard/student/`)
  },
  getTeacherDashboard: () => {
    console.log(api)
    return api.get(`/dashboard/teacher`)
  },
  getAdminDashboard: () => {
    return api.get(`/dashboard/admin`)
  },
}

export default api
