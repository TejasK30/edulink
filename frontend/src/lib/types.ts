import { ReactNode } from "react"

export type UserRoleType = "student" | "teacher" | "admin"

export interface User {
  _id: string
  name: string
  email: string
  role: UserRoleType
  collegname: string
  collegeid: string
  department?: string
}

export interface Department {
  _id: string
  name: string
  collegeId: string
}

export interface Course {
  _id: string
  name: string
  code: string
  credits: number
  description?: string
  teacherId?: string
  departmentId: string
  collegeId: string
  semesterId: string
}

export type UserFormData = {
  _id?: string
  name: string
  email: string
  password?: string
  department?: string
  role?: UserRoleType
  collegeId?: string
}

export type CourseFormData = {
  _id?: string
  name: string
  code: string
  credits: number
  description?: string
  topics?: { title: string; description: string }[]
  teacherId?: string
  departmentId?: string
  collegeId?: string
  semesterId?: string
}

export interface Announcement {
  _id: string
  title: string
  content: string
  authorId: {
    _id: string
    name: string
  }
  authorRole: "admin" | "teacher"
  createdAt: string
  collegeId: {
    _id: string
    name: string
  }
  departmentId?: {
    _id: string
    name: string
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface Feature {
  title: string
  description: string
  icon: string
  id: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  message: string
  avatarUrl?: string
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  isPopular?: boolean
  buttonText: string
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  isExternal?: boolean
}

export interface Step {
  number: number
  label: string
}

export interface ProgressBarProps {
  steps: Step[]
  currentStep: number
}

export interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  change: string
}

export interface TitleSectionProps {
  title: string
  subheading?: string
  pill: string
}

export enum FeeType {
  TUITION = "TUITION",
  EXAM = "EXAM",
  LIBRARY = "LIBRARY",
  TRANSPORT = "TRANSPORT",
  HOSTEL = "HOSTEL",
  DEVELOPMENT = "DEVELOPMENT",
  ADMISSION = "ADMISSION",
}

export enum PaymentMethod {
  CARD = "CARD",
  UPI = "UPI",
  NET_BANKING = "NET_BANKING",
  WALLET = "WALLET",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum PaymentFailureReason {
  INSUFFICIENT_FUNDS = "insufficient_funds",
  AUTHENTICATION_FAILED = "authentication_failed",
  PAYMENT_TIMED_OUT = "payment_timed_out",
  GATEWAY_ERROR = "gateway_error",
  CARD_DECLINED = "card_declined",
}

export interface FeeDetail {
  feeType: FeeType
  amount: number
}

export interface FeeTypeInfo {
  value: FeeType
  label: string
  amount: number
}

export interface InstallmentOption {
  value: number
  label: string
}

export interface PaymentMethodInfo {
  type: PaymentMethod
  label: string
  icon: string
  options?: Array<{
    code: string
    name: string
  }>
}

export interface CardPaymentDetails {
  cardNumber: string
  cardHolderName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

export interface UPIPaymentDetails {
  upiId: string
}

export interface NetBankingPaymentDetails {
  bankCode: string
  username: string
}

export interface WalletPaymentDetails {
  walletType: string
  mobileNumber: string
}

export type PaymentDetails =
  | CardPaymentDetails
  | UPIPaymentDetails
  | NetBankingPaymentDetails
  | WalletPaymentDetails

export interface Payment {
  _id: string
  studentId: string
  amountPaid: number
  currency: string
  paymentDate: string
  feeDetails: FeeDetail[]
  transactionId: string
  paymentStatus: PaymentStatus
  receiptPath?: string
  isInstallment?: boolean
  installmentNumber?: number
  totalInstallments?: number
  remainingAmount?: number
  paymentMethod?: PaymentMethod
  gatewayReference?: string
  failureReason?: string
}

export interface PendingInstallment {
  feeTypes: FeeType[]
  nextInstallment: number
  totalInstallments: number
  remainingAmount: number
}

export interface FeePaymentDue {
  feeType: FeeType
  amount: number
  label: string
  dueDate: string
}

export interface NotificationSettings {
  userId: string
  enableEmailNotifications: boolean
  enableSmsNotifications: boolean
  reminderFrequency: "daily" | "weekly" | "monthly"
}

export interface PaymentInitiateResponse {
  _id: string
  amountPaid: number
  currency: string
  isInstallment: boolean
  installmentNumber?: number
  totalInstallments?: number
  remainingAmount?: number
}

export interface PaymentProcessResponse {
  _id: string
  paymentStatus: PaymentStatus
  gatewayReference: string
  requiresOTP?: boolean
  failureReason?: string
}

export interface PaymentCompleteResponse {
  _id: string
  transactionId: string
  amountPaid: number
  currency: string
  paymentStatus: PaymentStatus
  receiptPath: string
  isInstallment?: boolean
  installmentNumber?: number
  totalInstallments?: number
  remainingAmount?: number
}

export interface Student {
  _id: string
  name: string
  email: string
}

export interface PaymentWithStudent extends Payment {
  student: {
    name: string
    email: string
    _id: string
  }
  department: {
    name: string
    _id: string
  }
  college?: {
    _id: string
    name: string
  }
}

export interface FeeSummary {
  feeType: string
  totalAmount: number
  count: number
}

export interface PaymentMethodSummary {
  method: PaymentMethod
  totalAmount: number
  count: number
}

export interface InstallmentSummary {
  isInstallment: boolean
  totalAmount: number
  count: number
}

export interface MonthlyData {
  year: number
  month: number
  totalAmount: number
  count: number
}

export interface PaymentSummary {
  feeSummary: FeeSummary[]
  paymentMethodSummary: PaymentMethodSummary[]
  installmentSummary: InstallmentSummary[]
  monthlyData: MonthlyData[]
}

export interface DueInstallment {
  _id: string
  studentId: string
  student: {
    name: string
    email: string
    _id: string
  }
  installmentNumber: number
  totalInstallments: number
  nextDueDate: string
  remainingAmount: number
}

export const FEE_AMOUNTS = {
  [FeeType.TUITION]: 50000,
  [FeeType.EXAM]: 2000,
  [FeeType.HOSTEL]: 10000,
  [FeeType.LIBRARY]: 0,
  [FeeType.TRANSPORT]: 0,
  [FeeType.DEVELOPMENT]: 0,
  [FeeType.ADMISSION]: 0,
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export const getMonthName = (month: number): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[month - 1]
}

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.PROCESSING]: "Processing",
  [PaymentStatus.COMPLETED]: "Completed",
  [PaymentStatus.FAILED]: "Failed",
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CARD]: "Credit/Debit Card",
  [PaymentMethod.UPI]: "UPI",
  [PaymentMethod.NET_BANKING]: "Net Banking",
  [PaymentMethod.WALLET]: "Wallet",
}

export const FeeTypeLabels: Record<FeeType, string> = {
  [FeeType.TUITION]: "Tuition Fee",
  [FeeType.EXAM]: "Examination Fee",
  [FeeType.LIBRARY]: "Library Fee",
  [FeeType.TRANSPORT]: "Transport Fee",
  [FeeType.HOSTEL]: "Hostel Fee",
  [FeeType.DEVELOPMENT]: "Development Fee",
  [FeeType.ADMISSION]: "Admission Fee",
}

export interface InstallmentDetails {
  currentInstallment: number
  totalInstallments: number
  remainingInstallments: number
  nextInstallmentDate?: string
}

export interface FeePayment {
  _id: string
  transactionId: string
  userId: string
  amount: number
  feeTypes: FeeType[]
  paymentDate: string
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  receiptUrl?: string
  paymentGatewayUrl?: string
  installmentDetails?: InstallmentDetails
}
export interface FeeTypeSummary {
  feeType: FeeType
  totalAmount: number
  count: number
}

export interface SummaryResponse {
  feeSummary: FeeTypeSummary[]
  paymentMethodSummary: PaymentMethodSummary[]
  installmentSummary: InstallmentSummary[]
  monthlyData: MonthlyData[]
}

export interface AllPaymentsResponse {
  payments: PaymentWithStudent[]
  total?: number
  page?: number
  limit?: number
}
