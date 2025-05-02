import api from "@/lib/api"
import { AxiosError } from "axios"

export interface Fee {
  _id: string
  name: string
  amount: number
  dueDate: string
  collegeId: string
  description?: string
  createdAt: string
  updatedAt: string
  status?: string
  studentId?: string
  payments?: FeePayment[]
}

export interface FeePayment {
  _id: string
  feeId: string
  amount: number
  paymentMethod: string
  paymentDate: string
  transactionId?: string
  notes?: string
  status: string
}

export interface FeePaymentData {
  feeId: string
  amount: number
  paymentMethod: string
  transactionId?: string
  notes?: string
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

export interface FilterParams {
  collegeId?: string
  dueDate?: string
  status?: string
  name?: string
  startDate?: string
  endDate?: string
  [key: string]: string | undefined
}

export async function getStudentFees(studentId: string) {
  try {
    const response = await api.get(`/fees/student/${studentId}`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>
    throw new Error(
      err.response?.data?.message || "Failed to fetch student fees"
    )
  }
}

export async function getFeeDetails(feeId: string) {
  try {
    const response = await api.get(`/fees/details/${feeId}`, {
      withCredentials: true,
    })
    return response.data.fee
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>
    throw new Error(
      err.response?.data?.message || "Failed to fetch fee details"
    )
  }
}

export async function makePayment(
  studentId: string,
  paymentData: FeePaymentData
) {
  try {
    const response = await api.post(`/fees/payment/${studentId}`, paymentData, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>
    throw new Error(err.response?.data?.message || "Failed to process payment")
  }
}

export function downloadReceipt(feeId: string, paymentId: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  window.open(`${API_URL}/fees/receipt/${feeId}/${paymentId}`, "_blank")
}

export async function getAllFees(
  userId: string,
  page = 1,
  limit = 10,
  filters: FilterParams = {}
) {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params[key] = value
    }
  })

  try {
    const response = await api.get(`/fees/admin/${userId}/fees/all`, {
      params,
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>
    throw new Error(err.response?.data?.message || "Failed to fetch fees")
  }
}

export async function getFeeSummary(collegeId: string) {
  try {
    const response = await api.get(`/fees/summary/${collegeId}`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>
    throw new Error(
      err.response?.data?.message || "Failed to fetch fee summary"
    )
  }
}

export async function getUnpaidStudents(filters: FilterParams = {}) {
  const params: Record<string, string> = {}

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params[key] = value
    }
  })

  try {
    const response = await api.get("/fees/unpaid", {
      params,
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>
    throw new Error(
      err.response?.data?.message || "Failed to fetch unpaid students"
    )
  }
}

export async function sendFeeReminders(data: {
  studentIds: string[]
  message: string
  feeId?: string
}) {
  try {
    const response = await api.post("/fees/send-reminders", data, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>
    throw new Error(
      err.response?.data?.message || "Failed to send fee reminders"
    )
  }
}

export async function createFeeRecord(feeData: Partial<Fee>) {
  try {
    const response = await api.post("/fees/create", feeData, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>
    throw new Error(
      err.response?.data?.message || "Failed to create fee record"
    )
  }
}
