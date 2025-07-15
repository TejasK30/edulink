import {
  AllPaymentsResponse,
  NotificationSettings,
  PaymentDetails,
  PaymentMethod,
  SummaryResponse,
} from "@/lib/types"
import api, { API_BASE_URL } from "@/lib/api"
import { AxiosResponse } from "axios"
import "dotenv/config"

export const feeApi = {
  getFeeTypes: (): Promise<AxiosResponse<string[]>> => api.get(`/fee/types`),

  getInstallmentOptions: (): Promise<AxiosResponse<number[]>> =>
    api.get(`/fee/installment-options`),

  getPaymentMethods: (): Promise<AxiosResponse<PaymentMethod[]>> =>
    api.get(`/fee/payment-methods`),

  initiatePayment: (
    userId: string,
    feeTypes: string[],
    installmentOption = 1,
    currentInstallment = 1
  ): Promise<AxiosResponse<{ paymentId: string }>> =>
    api.post(`/fee/payment/initiate/${userId}`, {
      feeTypes,
      installmentOption,
      currentInstallment,
    }),

  processPayment: (
    paymentId: string,
    paymentMethod: PaymentMethod,
    paymentDetails: PaymentDetails
  ): Promise<AxiosResponse<{ redirectUrl?: string }>> =>
    api.post(`/fee/payment/process/${paymentId}`, {
      paymentMethod,
      paymentDetails,
    }),

  verifyOTP: (
    paymentId: string,
    otp: string
  ): Promise<AxiosResponse<{ success: boolean }>> =>
    api.post(`/fee/payment/verify-otp/${paymentId}`, { otp }),

  completePayment: (
    paymentId: string
  ): Promise<AxiosResponse<{ receiptUrl: string }>> =>
    api.post(`/fee/payment/complete/${paymentId}`),

  getPaymentStatus: (
    paymentId: string
  ): Promise<AxiosResponse<{ status: string }>> =>
    api.get(`/fee/payment/status/${paymentId}`),

  getPaymentHistory: (
    userId: string
  ): Promise<AxiosResponse<AllPaymentsResponse>> =>
    api.get(`/fee/history/${userId}`),

  getPendingInstallments: (
    userId: string
  ): Promise<AxiosResponse<AllPaymentsResponse>> =>
    api.get(`/fee/pending/${userId}`),

  getUserDues: (
    userId: string
  ): Promise<AxiosResponse<{ dueAmount: number }>> =>
    api.get(`/fee/dues/${userId}`),

  downloadReceipt: (paymentId: string): string =>
    `${API_BASE_URL}/fee/receipt/${paymentId}`,

  updateNotificationSettings: (
    userId: string,
    settings: NotificationSettings
  ): Promise<AxiosResponse<NotificationSettings>> =>
    api.post(`/fee/notifications/settings/${userId}`, settings),

  getNotificationSettings: (
    userId: string
  ): Promise<AxiosResponse<NotificationSettings>> =>
    api.get(`/fee/notifications/settings/${userId}`),

  // ADMIN endpoints
  getAllPayments: (
    adminId: string,
    page = 1,
    limit = 20
  ): Promise<AxiosResponse<AllPaymentsResponse>> =>
    api.get<AllPaymentsResponse>(
      `/fee/admin/${adminId}/all?page=${page}&limit=${limit}`
    ),

  getPaymentSummary: (
    adminId: string
  ): Promise<AxiosResponse<SummaryResponse>> =>
    api.get<SummaryResponse>(`/fee/admin/${adminId}/summary`),

  getFailedPayments: (
    adminId: string
  ): Promise<AxiosResponse<AllPaymentsResponse>> =>
    api.get<AllPaymentsResponse>(`/admin/${adminId}/failed`),

  getDueInstallments: (
    adminId: string
  ): Promise<AxiosResponse<AllPaymentsResponse>> =>
    api.get<AllPaymentsResponse>(`/admin/${adminId}/due-installments`),

  sendPaymentReminders: (
    adminId: string,
    paymentIds: string[]
  ): Promise<AxiosResponse<{ sentTo: number }>> =>
    api.post(`/admin/${adminId}/reminders/send`, { paymentIds }),
}

export default api
