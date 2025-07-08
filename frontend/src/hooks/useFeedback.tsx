import {
  useMutation,
  useQuery,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query"
import api from "@/lib/api"
import {
  Teacher,
  FeedbackPayload,
  FeedbackResponse,
  ApiError,
} from "@/types/feedback.types"

interface TeachersApiResponse {
  users: Teacher[]
}

export const useTeachers = (
  collegeId: string | undefined
): UseQueryResult<Teacher[], Error> => {
  console.log(collegeId)

  return useQuery({
    queryKey: ["teachers", collegeId],
    queryFn: async (): Promise<Teacher[]> => {
      const response = await api.get<TeachersApiResponse>(
        `/users?role=teacher&collegeId=${collegeId}`
      )

      return response.data.users || []
    },
    enabled: !!collegeId,
  })
}

export const useFeedbackSubmission = (): UseMutationResult<
  FeedbackResponse,
  ApiError,
  { userId: string; payload: FeedbackPayload }
> => {
  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string
      payload: FeedbackPayload
    }): Promise<FeedbackResponse> => {
      const response = await api.post<FeedbackResponse>(
        `/feedback/${userId}`,
        payload
      )
      return response.data
    },
  })
}
