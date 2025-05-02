import FeePayment, {
  FeeType,
  PaymentStatus,
  IFeePayment,
} from "../models/FeePayment"
import { UserModel } from "../models/user"
import { generateReceipt } from "./pdfGenerator"
import { sendFeeReceipt } from "./emailService"
import {
  initiatePayment,
  verifyOTP,
  processPayment,
  PaymentMethod,
  PaymentStatus as GatewayPaymentStatus,
  PaymentDetails,
} from "./paymentGateway"
import {
  calculateTotalAmount,
  calculateInstallmentAmount,
  calculateRemaining,
} from "../helpers"
import { INSTALLMENT_SURCHARGE_PERCENTAGE } from "../constants"
import { v4 as uuidv4 } from "uuid"

/**
 * Creates a new fee payment record in pending status
 */
export const createPendingPayment = async (
  userId: string,
  collegeId: string,
  departmentId: string,
  feeTypes: FeeType[],
  installmentOption: number = 1,
  currentInstallment: number = 1
): Promise<IFeePayment> => {
  // Calculate total amount for these fee types
  const totalAmount = calculateTotalAmount(feeTypes)

  // Check if this is an installment payment
  const isInstallment = installmentOption > 1

  // Calculate amount for this installment (with surcharge if applicable)
  let amountToPay = totalAmount
  let remainingAmount = 0

  if (isInstallment) {
    // Apply surcharge for installment payments
    const totalWithSurcharge =
      totalAmount * (1 + INSTALLMENT_SURCHARGE_PERCENTAGE / 100)

    // Calculate this installment's amount
    const installmentResult = calculateInstallmentAmount(
      totalWithSurcharge,
      installmentOption,
      currentInstallment
    )

    amountToPay = installmentResult.amount
    remainingAmount = installmentResult.remaining
  }

  // Create fee details array based on fee types
  const feeDetails = feeTypes.map((feeType) => ({
    feeType,
    amount: isInstallment
      ? (getFeeAmount(feeType) * amountToPay) / totalAmount // Proportional distribution
      : getFeeAmount(feeType),
  }))

  // Create new payment record
  const payment = new FeePayment({
    studentId: userId,
    collegeId,
    departmentId,
    amountPaid: amountToPay,
    feeDetails,
    paymentStatus: PaymentStatus.PENDING,
    transactionId: uuidv4(),
    isInstallment,
    installmentNumber: isInstallment ? currentInstallment : undefined,
    totalInstallments: isInstallment ? installmentOption : undefined,
    remainingAmount: isInstallment ? remainingAmount : undefined,
  })

  console.log(`backend payment id: ${payment.transactionId}`)

  return await payment.save()
}

/**
 * Initiates payment process via payment gateway
 */
export const initiateFeePayment = async (
  payment: IFeePayment,
  paymentMethod: PaymentMethod,
  paymentDetails: PaymentDetails
): Promise<{ payment: IFeePayment; gatewayResponse: any }> => {
  try {
    // Increment payment attempts
    payment.paymentAttempts = (payment.paymentAttempts || 0) + 1
    payment.paymentMethod = paymentMethod
    await payment.save()

    // Initiate payment with gateway
    const gatewayResponse = await initiatePayment(
      payment.amountPaid,
      paymentMethod,
      paymentDetails
    )

    // Update payment with gateway reference
    if (gatewayResponse.gatewayReference) {
      payment.gatewayReference = gatewayResponse.gatewayReference

      // Update status based on gateway response
      if (gatewayResponse.status === GatewayPaymentStatus.PROCESSING) {
        payment.paymentStatus = PaymentStatus.PROCESSING
      } else if (gatewayResponse.status === GatewayPaymentStatus.FAILED) {
        payment.paymentStatus = PaymentStatus.FAILED
        payment.failureReason = gatewayResponse.failureReason
      }

      await payment.save()
    }

    return { payment, gatewayResponse }
  } catch (error) {
    console.error("Payment initiation error:", error)
    payment.paymentStatus = PaymentStatus.FAILED
    payment.failureReason = "Technical error during payment initiation"
    await payment.save()
    throw error
  }
}

/**
 * Verifies OTP for payments that require it
 */
export const verifyPaymentOTP = async (
  paymentId: string,
  otp: string
): Promise<{ payment: IFeePayment; gatewayResponse: any }> => {
  try {
    // Find payment
    const payment = await FeePayment.findById(paymentId)
    if (!payment) {
      throw new Error("Payment not found")
    }

    // Check if payment has gateway reference
    if (!payment.gatewayReference) {
      throw new Error("Invalid payment state: No gateway reference")
    }

    // Verify OTP with gateway
    const gatewayResponse = await verifyOTP(payment.gatewayReference, otp)

    // Update payment status based on OTP verification
    if (gatewayResponse.status === GatewayPaymentStatus.PROCESSING) {
      payment.paymentStatus = PaymentStatus.PROCESSING
      await payment.save()
    } else if (gatewayResponse.status === GatewayPaymentStatus.FAILED) {
      payment.paymentStatus = PaymentStatus.FAILED
      payment.failureReason = gatewayResponse.failureReason
      await payment.save()
    }

    return { payment, gatewayResponse }
  } catch (error) {
    console.error("OTP verification error:", error)
    const payment = await FeePayment.findById(paymentId)
    if (payment) {
      payment.paymentStatus = PaymentStatus.FAILED
      payment.failureReason = "Technical error during OTP verification"
      await payment.save()
    }
    throw error
  }
}

/**
 * Completes the payment processing
 */
export const completePaymentProcessing = async (
  paymentId: string,
  user: UserModel
): Promise<{ payment: IFeePayment; success: boolean }> => {
  try {
    // Find payment
    const payment = await FeePayment.findById(paymentId)
    if (!payment) {
      throw new Error("Payment not found")
    }

    // Check if payment is in processing state
    if (payment.paymentStatus !== PaymentStatus.PROCESSING) {
      throw new Error(`Invalid payment status: ${payment.paymentStatus}`)
    }

    // Check if payment has gateway reference
    if (!payment.gatewayReference) {
      throw new Error("Invalid payment state: No gateway reference")
    }

    // Process payment with gateway
    const gatewayResponse = await processPayment(payment.gatewayReference)

    if (gatewayResponse.success) {
      // Update payment with transaction ID and status
      payment.transactionId = gatewayResponse.transactionId
      payment.paymentStatus = PaymentStatus.COMPLETED

      // Generate receipt
      const receiptFilename = await generateReceipt(payment, user)
      payment.receiptPath = receiptFilename

      // Send email with receipt
      const emailSent = await sendFeeReceipt(user, payment, receiptFilename)
      payment.receiptSent = emailSent

      await payment.save()

      return { payment, success: true }
    } else {
      // Update payment as failed
      payment.paymentStatus = PaymentStatus.FAILED
      payment.failureReason = gatewayResponse.failureReason
      await payment.save()

      return { payment, success: false }
    }
  } catch (error) {
    console.error("Payment completion error:", error)
    const payment = await FeePayment.findById(paymentId)
    if (payment) {
      payment.paymentStatus = PaymentStatus.FAILED
      payment.failureReason = "Technical error during payment processing"
      await payment.save()
    }
    throw error
  }
}

/**
 * Helper function to get fee amount for a specific fee type
 */
const getFeeAmount = (feeType: FeeType): number => {
  switch (feeType) {
    case FeeType.TUITION:
      return 50000
    case FeeType.EXAM:
      return 2000
    case FeeType.HOSTEL:
      return 10000
    default:
      return 0
  }
}
