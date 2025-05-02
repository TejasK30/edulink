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
      const isSuccessful = Math.random() < 0.95
      resolve(isSuccessful)
    }, SIMULATED_PAYMENT_DELAY)
  })
}

export const calculateInstallmentAmount = (
  totalAmount: number,
  totalInstallments: number,
  currentInstallment: number
): { amount: number; remaining: number } => {
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

  const baseAmount = Math.floor(totalAmount / totalInstallments)

  if (currentInstallment === totalInstallments) {
    const previousInstallmentsTotal = baseAmount * (totalInstallments - 1)
    return {
      amount: totalAmount - previousInstallmentsTotal,
      remaining: 0,
    }
  }

  const remaining = totalAmount - baseAmount * currentInstallment

  return { amount: baseAmount, remaining }
}

export const calculateRemaining = (
  totalAmount: number,
  totalInstallments: number,
  completedInstallments: number
): number => {
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

  const baseAmount = Math.floor(totalAmount / totalInstallments)

  return totalAmount - baseAmount * completedInstallments
}

export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  console.log(`Generated Payment OTP: ${otp}`)
  return otp
}

export const maskCardNumber = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/[\s-]/g, "")

  if (cleanNumber.length < 12 || cleanNumber.length > 19) {
    return "Invalid card number"
  }

  const lastFour = cleanNumber.slice(-4)

  const maskedPart = "X".repeat(cleanNumber.length - 4)

  let masked = ""
  for (let i = 0; i < maskedPart.length; i++) {
    masked += maskedPart[i]
    if ((i + 1) % 4 === 0) masked += " "
  }

  return (masked + lastFour).trim()
}
