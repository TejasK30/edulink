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

// Simulate initial payment authorization
export const initiatePayment = async (
  amount: number,
  paymentMethod: PaymentMethod,
  paymentDetails: PaymentDetails
): Promise<PaymentGatewayResponse> => {
  console.log(`Initiating payment of ${amount} via ${paymentMethod}`)

  // Add delay to simulate processing
  await delay(SIMULATED_PAYMENT_DELAY / 2)

  // Generate a gateway reference
  const gatewayReference = `PG${Date.now().toString().substr(-8)}${Math.floor(
    Math.random() * 10000
  )}`

  // Simulate if the payment requires OTP (80% of cases for cards)
  const requiresOTP =
    paymentMethod === PaymentMethod.CARD && Math.random() < 0.8

  // Simulate payment method validation
  // (10% chance of early validation failure)
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

  // If no OTP required, proceed directly to processing
  return {
    success: true,
    status: PaymentStatus.PROCESSING,
    transactionId: "",
    message: "Payment is being processed",
    paymentMethod,
    gatewayReference,
  }
}

// Verify OTP and complete payment
export const verifyOTP = async (
  gatewayReference: string,
  otp: string
): Promise<PaymentGatewayResponse> => {
  console.log(`Verifying OTP for payment ${gatewayReference}`)

  // Add delay to simulate OTP verification
  await delay(SIMULATED_PAYMENT_DELAY / 2)

  // Simulate OTP verification (95% success rate)
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

  // Proceed with payment processing
  return {
    success: true,
    status: PaymentStatus.PROCESSING,
    transactionId: "",
    message: "OTP verified successfully. Payment is being processed",
    gatewayReference,
  }
}

// Process the payment (final step)
export const processPayment = async (
  gatewayReference: string
): Promise<PaymentGatewayResponse> => {
  console.log(`Processing payment ${gatewayReference}`)

  // Add delay to simulate payment processing
  await delay(SIMULATED_PAYMENT_DELAY)

  // Generate transaction ID for successful payments
  const transactionId = `TXN${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`

  // Simulate payment processing (95% success rate)
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

// Helper functions
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
