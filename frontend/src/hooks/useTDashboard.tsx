import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/services/dashboardService"
import { DashboardData } from "@/types/teacher.types"

export const useTeacherDashboard = (
  teacherId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["teacher-dashboard", teacherId],
    queryFn: async () => {
      const response = await dashboardService.getTeacherDashboard(teacherId)
      return response.data as DashboardData
    },
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
