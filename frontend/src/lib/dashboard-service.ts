import api from "./api"

export const dashboardService = {
  getStudentDashboard: (userId: string) => {
    return api.get(`/dashboard/student/${userId}`)
  },
  getTeacherDashboard: (userId: string) => {
    return api.get(`/dashboard/teacher/${userId}`)
  },
  getAdminDashboard: (userId: string) => {
    return api.get(`/dashboard/admin/${userId}`)
  },
}

export default api
