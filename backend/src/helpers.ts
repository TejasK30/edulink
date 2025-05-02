import crypto from "crypto"
import { FeeType } from "./models/FeePayment"
import { FEE_AMOUNTS, SIMULATED_PAYMENT_DELAY } from "./constants"

export const generateTransactionId = (): string => {
  return `TXN${Date.now()}-${crypto.randomBytes(6).toString("hex")}`
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export const validateFeeType = (feeType: string): boolean => {
  return Object.values(FeeType).includes(feeType as FeeType)
}

export const calculateTotalAmount = (feeTypes: FeeType[]): number => {
  return feeTypes.reduce((total, feeType) => {
    switch (feeType) {
      case FeeType.TUITION:
        return total + FEE_AMOUNTS.TUITION
      case FeeType.EXAM:
        return total + FEE_AMOUNTS.EXAM
      case FeeType.HOSTEL:
        return total + FEE_AMOUNTS.HOSTEL
      default:
        return total
    }
  }, 0)
}

export const getFeeAmount = (feeType: FeeType): number => {
  switch (feeType) {
    case FeeType.TUITION:
      return FEE_AMOUNTS.TUITION
    case FeeType.EXAM:
      return FEE_AMOUNTS.EXAM
    case FeeType.HOSTEL:
      return FEE_AMOUNTS.HOSTEL
    default:
      return 0
  }
}

export const simulatePayment = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 95% success rate for simulation
      const isSuccessful = Math.random() < 0.95
      resolve(isSuccessful)
    }, SIMULATED_PAYMENT_DELAY)
  })
}

/**
 * Calculate the amount for a specific installment
 * @param totalAmount Total fee amount (with surcharge)
 * @param totalInstallments Number of installments
 * @param currentInstallment Current installment number (1-based)
 * @returns Object with amount for current installment and remaining amount
 */
export const calculateInstallmentAmount = (
  totalAmount: number,
  totalInstallments: number,
  currentInstallment: number
): { amount: number; remaining: number } => {
  // Validate inputs
  if (totalInstallments < 1) {
    throw new Error("Total installments must be at least 1")
  }

  if (currentInstallment < 1 || currentInstallment > totalInstallments) {
    throw new Error(
      `Current installment must be between 1 and ${totalInstallments}`
    )
  }

  if (totalInstallments === 1) {
    return { amount: totalAmount, remaining: 0 }
  }

  // Calculate base installment amount
  const baseAmount = Math.floor(totalAmount / totalInstallments)

  // For the last installment, adjust amount to account for rounding errors
  if (currentInstallment === totalInstallments) {
    const previousInstallmentsTotal = baseAmount * (totalInstallments - 1)
    return {
      amount: totalAmount - previousInstallmentsTotal,
      remaining: 0,
    }
  }

  // Calculate remaining amount
  const remaining = totalAmount - baseAmount * currentInstallment

  return { amount: baseAmount, remaining }
}

/**
 * Calculate remaining amount after a specific installment
 * @param totalAmount Total fee amount
 * @param totalInstallments Number of installments
 * @param completedInstallments Number of completed installments
 * @returns Remaining amount to be paid
 */
export const calculateRemaining = (
  totalAmount: number,
  totalInstallments: number,
  completedInstallments: number
): number => {
  // Validate inputs
  if (totalInstallments < 1) {
    throw new Error("Total installments must be at least 1")
  }

  if (completedInstallments < 0 || completedInstallments > totalInstallments) {
    throw new Error(
      `Completed installments must be between 0 and ${totalInstallments}`
    )
  }

  if (completedInstallments === totalInstallments) {
    return 0
  }

  // Calculate base installment amount
  const baseAmount = Math.floor(totalAmount / totalInstallments)

  // Calculate remaining amount
  return totalAmount - baseAmount * completedInstallments
}

/**
 * Generates a random OTP for payment verification
 * @returns A 6-digit OTP
 */
export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  console.log(`Generated Payment OTP: ${otp}`)
  return otp
}

/**
 * Mask a credit/debit card number to show only the last 4 digits
 * @param cardNumber The full card number
 * @returns Masked card number (e.g., "XXXX XXXX XXXX 1234")
 */
export const maskCardNumber = (cardNumber: string): string => {
  // Remove any spaces or dashes
  const cleanNumber = cardNumber.replace(/[\s-]/g, "")

  // Check if it's a valid length
  if (cleanNumber.length < 12 || cleanNumber.length > 19) {
    return "Invalid card number"
  }

  // Get last 4 digits
  const lastFour = cleanNumber.slice(-4)

  // Create mask for all but last 4 digits
  const maskedPart = "X".repeat(cleanNumber.length - 4)

  // Format with spaces for readability
  let masked = ""
  for (let i = 0; i < maskedPart.length; i++) {
    masked += maskedPart[i]
    if ((i + 1) % 4 === 0) masked += " "
  }

  return (masked + lastFour).trim()
}
