import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/api"
import {
  DetailedUser,
  User,
  Department,
  UserFormData,
} from "@/lib/schemas/users.schema"

export const useUsers = (role: string, collegeId: string) => {
  return useQuery({
    queryKey: ["users", role, collegeId],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${role}/${collegeId}`)
      return response.data as User[]
    },
    enabled: !!collegeId,
  })
}

export const useUserDetails = (
  role: string,
  userId: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: ["user-details", role, userId],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${role}/${userId}`)
      return response.data as DetailedUser
    },
    enabled: enabled && !!userId,
  })
}

export const useDepartments = (collegeId: string, shouldFetch: boolean) => {
  return useQuery({
    queryKey: ["departments", collegeId],
    queryFn: async () => {
      const response = await api.get(`/auth/colleges/${collegeId}/departments`)
      return response.data.data as Department[]
    },
    enabled: shouldFetch && !!collegeId,
  })
}

export const useCreateUser = (role: string, collegeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: UserFormData) => {
      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: role.toLowerCase(),
        ...(userData.department && { department: userData.department }),
      }
      const response = await api.post(
        `/admin/users/${collegeId}/create`,
        payload
      )
      return response.data
    },
    onSuccess: () => {
      toast(`${role} created successfully!`)
      queryClient.invalidateQueries({ queryKey: ["users", role, collegeId] })
    },
    onError: (error: any) => {
      toast.error(
        `Error creating ${role}: ${
          error.response?.data?.error || error.message
        }`
      )
    },
  })
}

export const useUpdateUser = (role: string, collegeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: string
      userData: UserFormData
    }) => {
      const { _id, ...payload } = userData
      if (!payload.password) {
        delete payload.password
      }
      if (payload.department === "") {
        delete payload.department
      }
      const response = await api.put(`/admin/users/${userId}`, payload)
      return response.data
    },
    onSuccess: () => {
      toast(`${role} updated successfully!`)
      queryClient.invalidateQueries({ queryKey: ["users", role, collegeId] })
    },
    onError: (error: any) => {
      toast.error(
        `Error updating ${role}: ${
          error.response?.data?.error || error.message
        }`
      )
    },
  })
}

export const useDeleteUser = (role: string, collegeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/admin/users/${userId}`)
      return response.data
    },
    onSuccess: () => {
      toast(`${role} deleted successfully!`)
      queryClient.invalidateQueries({ queryKey: ["users", role, collegeId] })
    },
    onError: (error: any) => {
      toast.error(
        `Error deleting ${role}: ${
          error.response?.data?.error || error.message
        }`
      )
    },
  })
}
