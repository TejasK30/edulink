import { SIMULATED_PAYMENT_DELAY } from "../constants"

export enum PaymentMethod {
  CARD = "CARD",
  UPI = "UPI",
  NET_BANKING = "NET_BANKING",
  WALLET = "WALLET",
}

export enum PaymentStatus {
  INITIATED = "initiated",
  PROCESSING = "processing",
  REQUIRES_OTP = "requires_otp",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum PaymentFailureReason {
  INSUFFICIENT_FUNDS = "insufficient_funds",
  AUTHENTICATION_FAILED = "authentication_failed",
  PAYMENT_TIMED_OUT = "payment_timed_out",
  GATEWAY_ERROR = "gateway_error",
  CARD_DECLINED = "card_declined",
}

export interface PaymentGatewayResponse {
  success: boolean
  status: PaymentStatus
  transactionId: string
  message: string
  failureReason?: PaymentFailureReason
  requiresOTP?: boolean
  paymentMethod?: PaymentMethod
  gatewayReference?: string
}

interface CardPaymentDetails {
  cardNumber: string
  cardHolderName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

interface UPIPaymentDetails {
  upiId: string
}

interface NetBankingPaymentDetails {
  bankCode: string
  username: string
}

interface WalletPaymentDetails {
  walletType: string
  mobileNumber: string
}

export type PaymentDetails =
  | CardPaymentDetails
  | UPIPaymentDetails
  | NetBankingPaymentDetails
  | WalletPaymentDetails

export const initiatePayment = async (
  amount: number,
  paymentMethod: PaymentMethod,
  paymentDetails: PaymentDetails
): Promise<PaymentGatewayResponse> => {
  console.log(`Initiating payment of ${amount} via ${paymentMethod}`)

  await delay(SIMULATED_PAYMENT_DELAY / 2)

  const gatewayReference = `PG${Date.now().toString().substr(-8)}${Math.floor(
    Math.random() * 10000
  )}`

  const requiresOTP =
    paymentMethod === PaymentMethod.CARD && Math.random() < 0.8
  if (Math.random() < 0.1) {
    const failureReason = simulateFailureReason(paymentMethod)
    return {
      success: false,
      status: PaymentStatus.FAILED,
      transactionId: "",
      message: `Payment validation failed: ${failureReason}`,
      failureReason,
      gatewayReference,
    }
  }

  if (requiresOTP) {
    return {
      success: true,
      status: PaymentStatus.REQUIRES_OTP,
      transactionId: "",
      message: "OTP verification required to complete payment",
      requiresOTP: true,
      paymentMethod,
      gatewayReference,
    }
  }

  return {
    success: true,
    status: PaymentStatus.PROCESSING,
    transactionId: "",
    message: "Payment is being processed",
    paymentMethod,
    gatewayReference,
  }
}

export const verifyOTP = async (
  gatewayReference: string,
  otp: string
): Promise<PaymentGatewayResponse> => {
  console.log(`Verifying OTP for payment ${gatewayReference}`)

  await delay(SIMULATED_PAYMENT_DELAY / 2)

  const otpValid = Math.random() < 0.95

  if (!otpValid) {
    return {
      success: false,
      status: PaymentStatus.FAILED,
      transactionId: "",
      message: "OTP verification failed",
      failureReason: PaymentFailureReason.AUTHENTICATION_FAILED,
      gatewayReference,
    }
  }

  return {
    success: true,
    status: PaymentStatus.PROCESSING,
    transactionId: "",
    message: "OTP verified successfully. Payment is being processed",
    gatewayReference,
  }
}

export const processPayment = async (
  gatewayReference: string
): Promise<PaymentGatewayResponse> => {
  console.log(`Processing payment ${gatewayReference}`)

  await delay(SIMULATED_PAYMENT_DELAY)

  const transactionId = `TXN${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`

  const paymentSuccessful = Math.random() < 0.95

  if (paymentSuccessful) {
    return {
      success: true,
      status: PaymentStatus.COMPLETED,
      transactionId,
      message: "Payment completed successfully",
      gatewayReference,
    }
  } else {
    const failureReason = simulateRandomFailureReason()
    return {
      success: false,
      status: PaymentStatus.FAILED,
      transactionId: "",
      message: `Payment failed: ${failureReason}`,
      failureReason,
      gatewayReference,
    }
  }
}

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const simulateFailureReason = (
  paymentMethod: PaymentMethod
): PaymentFailureReason => {
  if (paymentMethod === PaymentMethod.CARD) {
    return Math.random() < 0.5
      ? PaymentFailureReason.INSUFFICIENT_FUNDS
      : PaymentFailureReason.CARD_DECLINED
  }

  return simulateRandomFailureReason()
}

const simulateRandomFailureReason = (): PaymentFailureReason => {
  const reasons = Object.values(PaymentFailureReason)
  const randomIndex = Math.floor(Math.random() * reasons.length)
  return reasons[randomIndex]
}
