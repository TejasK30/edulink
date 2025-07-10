import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { toast } from "sonner"
import { Semester, Department } from "@/lib/schemas/semster.schema"

export const useDepartments = (collegeId?: string) =>
  useQuery<Department[]>({
    enabled: !!collegeId,
    queryKey: ["departments", collegeId],
    queryFn: async () => {
      const res = await api.get(`/auth/colleges/${collegeId}/departments`)
      return res.data.data
    },
  })

export const useSemesters = (collegeId?: string) =>
  useQuery<Semester[]>({
    enabled: !!collegeId,
    queryKey: ["semesters", collegeId],
    queryFn: async () => {
      const res = await api.get(`/admin/colleges/${collegeId}/semesters`)
      return res.data
    },
  })

export const useToggleSemester = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, current }: { id: string; current: boolean }) => {
      await api.patch(`/courses/semesters/${id}`, { isActive: !current })
    },
    onSuccess: () => {
      toast.success("Semester status updated")
      queryClient.invalidateQueries({ queryKey: ["semesters"] })
    },
    onError: () => toast.error("Failed to update semester"),
  })
}
