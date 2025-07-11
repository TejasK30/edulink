import { Request, Response } from "express"
import fs from "fs"
import mongoose from "mongoose"
import path from "path"
import {
  BANK_OPTIONS,
  CURRENCY,
  FEE_AMOUNTS,
  INSTALLMENT_OPTIONS,
  INSTALLMENT_SURCHARGE_PERCENTAGE,
  WALLET_OPTIONS,
} from "../constants"
import FeePayment, { FeeType, PaymentStatus } from "../models/FeePayment"
import User, { UserRole } from "../models/user"
import {
  completePaymentProcessing,
  createPendingPayment,
  initiateFeePayment,
  verifyPaymentOTP,
} from "../utils/feeService"
import {
  PaymentStatus as GatewayPaymentStatus,
  PaymentMethod,
} from "../utils/paymentGateway"

export const getFeeTypes = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const feeTypes = Object.values(FeeType).map((type) => {
      const typeKey = type.toUpperCase() as keyof typeof FEE_AMOUNTS
      return {
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        amount: FEE_AMOUNTS[typeKey],
      }
    })

    return res.status(200).json({ feeTypes })
  } catch (error) {
    console.error("Error fetching fee types:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getInstallmentOptions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    return res.status(200).json({
      installmentOptions: INSTALLMENT_OPTIONS,
      surchargePercentage: INSTALLMENT_SURCHARGE_PERCENTAGE,
    })
  } catch (error) {
    console.error("Error fetching installment options:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getPaymentMethods = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const paymentMethods = [
      {
        type: PaymentMethod.CARD,
        label: "Credit Card",
        icon: "credit-card",
      },
      {
        type: PaymentMethod.UPI,
        label: "UPI",
        icon: "upi",
      },
      {
        type: PaymentMethod.NET_BANKING,
        label: "Net Banking",
        icon: "net-banking",
        options: BANK_OPTIONS,
      },
      {
        type: PaymentMethod.WALLET,
        label: "Mobile Wallet",
        icon: "wallet",
        options: WALLET_OPTIONS,
      },
    ]

    return res.status(200).json({ paymentMethods })
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const initiatePayment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userId } = req.params
  const { feeTypes, installmentOption = 1, currentInstallment = 1 } = req.body

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" })
    }

    if (!Array.isArray(feeTypes) || feeTypes.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one fee type must be selected" })
    }

    const validFeeTypes = feeTypes.every((type) =>
      Object.values(FeeType).includes(type as FeeType)
    )
    if (!validFeeTypes) {
      return res.status(400).json({ message: "Invalid fee type provided" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can make fee payments" })
    }

    const payment = await createPendingPayment(
      userId,
      user.college ? user.college.toString() : "",
      user.department ? user.department.toString() : "",
      feeTypes as FeeType[],
      installmentOption,
      currentInstallment
    )

    return res.status(200).json({
      message: "Payment initiated",
      payment: {
        _id: payment._id,
        amountPaid: payment.amountPaid,
        currency: CURRENCY,
        isInstallment: payment.isInstallment,
        installmentNumber: payment.installmentNumber,
        totalInstallments: payment.totalInstallments,
        remainingAmount: payment.remainingAmount,
      },
    })
  } catch (error) {
    console.error("Payment initiation error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const processPayment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { paymentId } = req.params
  const { paymentMethod, paymentDetails } = req.body

  console.log(
    `Processing payment with ID: ${paymentId} \nPayment method: ${paymentMethod} \nPayment details: ${JSON.stringify(
      paymentDetails
    )}`
  )

  try {
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid payment ID" })
    }

    if (
      !Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)
    ) {
      return res.status(400).json({ message: "Invalid payment method" })
    }

    const payment = await FeePayment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    if (payment.paymentStatus !== PaymentStatus.PENDING) {
      return res.status(400).json({
        message: `Payment is already in ${payment.paymentStatus} status and cannot be processed`,
      })
    }

    const { payment: updatedPayment, gatewayResponse } =
      await initiateFeePayment(
        payment,
        paymentMethod as PaymentMethod,
        paymentDetails
      )

    if (gatewayResponse.status === GatewayPaymentStatus.REQUIRES_OTP) {
      return res.status(200).json({
        message: "OTP verification required",
        requiresOTP: true,
        payment: {
          _id: updatedPayment._id,
          gatewayReference: updatedPayment.gatewayReference,
        },
      })
    } else if (gatewayResponse.status === GatewayPaymentStatus.PROCESSING) {
      return res.status(200).json({
        message: "Payment is being processed",
        requiresOTP: false,
        payment: {
          _id: updatedPayment._id,
          paymentStatus: updatedPayment.paymentStatus,
          gatewayReference: updatedPayment.gatewayReference,
        },
      })
    } else if (gatewayResponse.status === GatewayPaymentStatus.FAILED) {
      return res.status(400).json({
        message: `Payment failed: ${gatewayResponse.failureReason}`,
        payment: {
          _id: updatedPayment._id,
          paymentStatus: updatedPayment.paymentStatus,
          failureReason: gatewayResponse.failureReason,
        },
      })
    }

    return res
      .status(500)
      .json({ message: "Unexpected payment gateway response" })
  } catch (error) {
    console.error("Payment processing error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const verifyOTP = async (req: Request, res: Response): Promise<any> => {
  const { paymentId } = req.params
  const { otp } = req.body

  try {
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid payment ID" })
    }

    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return res.status(400).json({ message: "Invalid OTP" })
    }

    const { payment, gatewayResponse } = await verifyPaymentOTP(paymentId, otp)

    if (gatewayResponse.status === GatewayPaymentStatus.PROCESSING) {
      return res.status(200).json({
        message: "OTP verified successfully, payment is being processed",
        payment: {
          _id: payment._id,
          paymentStatus: payment.paymentStatus,
        },
      })
    } else if (gatewayResponse.status === GatewayPaymentStatus.FAILED) {
      return res.status(400).json({
        message: `OTP verification failed: ${gatewayResponse.failureReason}`,
        payment: {
          _id: payment._id,
          paymentStatus: payment.paymentStatus,
          failureReason: gatewayResponse.failureReason,
        },
      })
    }

    return res
      .status(500)
      .json({ message: "Unexpected gateway response for OTP verification" })
  } catch (error) {
    console.error("OTP verification error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const completePayment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { paymentId } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid payment ID" })
    }

    const payment = await FeePayment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    const user = await User.findById(payment.studentId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const { payment: completedPayment, success } =
      await completePaymentProcessing(paymentId, user)

    if (success) {
      return res.status(200).json({
        message: "Payment completed successfully",
        payment: {
          _id: completedPayment._id,
          transactionId: completedPayment.transactionId,
          amountPaid: completedPayment.amountPaid,
          currency: completedPayment.currency,
          paymentStatus: completedPayment.paymentStatus,
          receiptPath: completedPayment.receiptPath,
          isInstallment: completedPayment.isInstallment,
          installmentNumber: completedPayment.installmentNumber,
          totalInstallments: completedPayment.totalInstallments,
          remainingAmount: completedPayment.remainingAmount,
        },
      })
    } else {
      return res.status(400).json({
        message: `Payment failed: ${completedPayment.failureReason}`,
        payment: {
          _id: completedPayment._id,
          paymentStatus: completedPayment.paymentStatus,
          failureReason: completedPayment.failureReason,
        },
      })
    }
  } catch (error) {
    console.error("Payment completion error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getPaymentStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { paymentId } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid payment ID" })
    }

    const payment = await FeePayment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    return res.status(200).json({
      payment: {
        _id: payment._id,
        transactionId: payment.transactionId,
        amountPaid: payment.amountPaid,
        currency: payment.currency,
        paymentStatus: payment.paymentStatus,
        paymentMethod: payment.paymentMethod,
        isInstallment: payment.isInstallment,
        installmentNumber: payment.installmentNumber,
        totalInstallments: payment.totalInstallments,
        remainingAmount: payment.remainingAmount,
        failureReason: payment.failureReason,
      },
    })
  } catch (error) {
    console.error("Error fetching payment status:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getPaymentHistory = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userId } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const payments = await FeePayment.find({
      studentId: userId,
      paymentStatus: PaymentStatus.COMPLETED,
    }).sort({ paymentDate: -1 })

    return res.status(200).json({
      payments: payments.map((payment) => ({
        _id: payment._id,
        transactionId: payment.transactionId,
        amountPaid: payment.amountPaid,
        currency: payment.currency,
        paymentDate: payment.paymentDate,
        feeDetails: payment.feeDetails,
        paymentMethod: payment.paymentMethod,
        isInstallment: payment.isInstallment,
        installmentNumber: payment.installmentNumber,
        totalInstallments: payment.totalInstallments,
        receiptPath: payment.receiptPath ? true : false,
      })),
    })
  } catch (error) {
    console.error("Error fetching payment history:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getPendingInstallments = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userId } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const completedPayments = await FeePayment.find({
      studentId: userId,
      isInstallment: true,
      paymentStatus: PaymentStatus.COMPLETED,
    }).sort({ installmentNumber: 1 })

    const installmentSummary: Record<
      string,
      {
        totalInstallments: number | undefined
        completedInstallments: number[]
        feeTypes: FeeType[]
        remainingAmount: number | undefined
      }
    > = {}

    completedPayments.forEach((payment) => {
      const key = payment.feeDetails
        .map((fee) => fee.feeType)
        .sort()
        .join("-")

      if (!installmentSummary[key]) {
        installmentSummary[key] = {
          totalInstallments: payment.totalInstallments,
          completedInstallments: [],
          feeTypes: payment.feeDetails.map((fee) => fee.feeType),
          remainingAmount: payment.remainingAmount,
        }
      }

      if (payment.installmentNumber) {
        installmentSummary[key].completedInstallments.push(
          payment.installmentNumber
        )
      }
    })

    const pendingInstallments: Array<{
      feeTypes: FeeType[]
      nextInstallment: number
      totalInstallments: number | undefined
      remainingAmount: number | undefined
    }> = []

    Object.keys(installmentSummary).forEach((key) => {
      const summary = installmentSummary[key]

      const highestCompleted = Math.max(...summary.completedInstallments)

      if (
        summary.totalInstallments &&
        highestCompleted < summary.totalInstallments
      ) {
        pendingInstallments.push({
          feeTypes: summary.feeTypes,
          nextInstallment: highestCompleted + 1,
          totalInstallments: summary.totalInstallments,
          remainingAmount: summary.remainingAmount,
        })
      }
    })

    return res.status(200).json({ pendingInstallments })
  } catch (error) {
    console.error("Error fetching pending installments:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const downloadReceipt = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { paymentId } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid payment ID" })
    }

    const payment = await FeePayment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    if (!payment.receiptPath) {
      return res.status(404).json({ message: "Receipt not found" })
    }

    const receiptPath = path.join(
      process.cwd(),
      "uploads",
      "receipts",
      payment.receiptPath
    )

    if (!fs.existsSync(receiptPath)) {
      return res.status(404).json({ message: "Receipt file not found" })
    }

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Payment_Receipt_${payment.transactionId}.pdf`
    )

    const fileStream = fs.createReadStream(receiptPath)
    fileStream.pipe(res)
  } catch (error) {
    console.error("Error downloading receipt:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getAllFeePayments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const admin = await User.findById(userId)
    console.log(admin)
    if (!admin || admin.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied" })
    }

    const adminCollegeId = admin.college

    const payments = await FeePayment.aggregate([
      {
        $match: { paymentStatus: PaymentStatus.COMPLETED },
      },
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $match: { "student.college": adminCollegeId },
      },
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: "$department" },
      { $sort: { paymentDate: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          transactionId: 1,
          amountPaid: 1,
          currency: 1,
          paymentDate: 1,
          feeDetails: 1,
          paymentMethod: 1,
          isInstallment: 1,
          installmentNumber: 1,
          totalInstallments: 1,
          studentId: 1,
          "student.name": 1,
          "student.email": 1,
          "department.name": 1,
        },
      },
    ])

    const totalCount = await FeePayment.countDocuments({
      paymentStatus: PaymentStatus.COMPLETED,
    })

    return res.status(200).json({
      payments,
      pagination: {
        total: totalCount,
        page: Number(page),
        pages: Math.ceil(totalCount / Number(limit)),
      },
    })
  } catch (error) {
    console.error("Error fetching all payments:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getFailedPayments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const failedPayments = await FeePayment.aggregate([
      {
        $match: { paymentStatus: PaymentStatus.FAILED },
      },
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $project: {
          _id: 1,
          amountPaid: 1,
          currency: 1,
          paymentDate: 1,
          paymentMethod: 1,
          failureReason: 1,
          paymentAttempts: 1,
          "student.name": 1,
          "student.email": 1,
        },
      },
    ])

    return res.status(200).json({ failedPayments })
  } catch (error) {
    console.error("Error fetching failed payments:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
export const getFeePaymentSummary = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params

    const admin = await User.findById(userId).select("role college")
    if (!admin || admin.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied" })
    }
    const adminCollegeId = new mongoose.Types.ObjectId(admin.college)

    const baseMatchAndJoin = [
      { $match: { paymentStatus: PaymentStatus.COMPLETED } },
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      { $match: { "student.college": adminCollegeId } },
    ]

    const feeSummary = await FeePayment.aggregate([
      ...baseMatchAndJoin,
      { $unwind: "$feeDetails" },
      {
        $group: {
          _id: "$feeDetails.feeType",
          totalAmount: { $sum: "$feeDetails.amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          feeType: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
    ])

    const paymentMethodSummary = await FeePayment.aggregate([
      ...baseMatchAndJoin,
      {
        $match: {
          paymentMethod: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$amountPaid" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          method: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
    ])

    const installmentSummary = await FeePayment.aggregate([
      ...baseMatchAndJoin,
      {
        $group: {
          _id: "$isInstallment",
          totalAmount: { $sum: "$amountPaid" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          isInstallment: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
    ])

    const monthlyData = await FeePayment.aggregate([
      ...baseMatchAndJoin,
      {
        $group: {
          _id: {
            year: { $year: "$paymentDate" },
            month: { $month: "$paymentDate" },
          },
          totalAmount: { $sum: "$amountPaid" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
    ])

    return res.status(200).json({
      feeSummary,
      paymentMethodSummary,
      installmentSummary,
      monthlyData,
    })
  } catch (error) {
    console.error("Error fetching payment summary:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getUserDues = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userId } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const completedPayments = await FeePayment.find({
      studentId: userId,
      paymentStatus: PaymentStatus.COMPLETED,
    })

    const requiredFeeTypes = Object.values(FeeType)

    const paidFeeTypes = new Set<string>()

    completedPayments.forEach((payment) => {
      payment.feeDetails.forEach((detail) => {
        if (
          !payment.isInstallment ||
          payment.installmentNumber === payment.totalInstallments
        ) {
          paidFeeTypes.add(detail.feeType)
        }
      })
    })

    const dues = requiredFeeTypes
      .filter((feeType) => !paidFeeTypes.has(feeType))
      .map((feeType) => {
        const amount =
          FEE_AMOUNTS[feeType.toUpperCase() as keyof typeof FEE_AMOUNTS]
        return {
          feeType,
          amount,
          label: feeType.charAt(0).toUpperCase() + feeType.slice(1),
          dueDate: calculateNextDueDate(),
        }
      })

    return res.status(200).json({ dues })
  } catch (error) {
    console.error("Error fetching user dues:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const updateNotificationSettings = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userId } = req.params
  const {
    enableEmailNotifications,
    enableSmsNotifications,
    reminderFrequency,
  } = req.body

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({
      message: "Notification settings updated successfully",
      settings: {
        userId,
        enableEmailNotifications,
        enableSmsNotifications,
        reminderFrequency,
      },
    })
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getNotificationSettings = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userId } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({
      settings: {
        userId,
        enableEmailNotifications: true,
        enableSmsNotifications: false,
        reminderFrequency: "weekly",
      },
    })
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getDueInstallments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const completedInstallments = await FeePayment.aggregate([
      {
        $match: {
          isInstallment: true,
          paymentStatus: PaymentStatus.COMPLETED,
          totalInstallments: { $gt: "$installmentNumber" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $project: {
          _id: 1,
          studentId: 1,
          "student.name": 1,
          "student.email": 1,
          installmentNumber: 1,
          totalInstallments: 1,
          nextDueDate: {
            $add: ["$paymentDate", 30 * 24 * 60 * 60 * 1000],
          },
          remainingAmount: 1,
        },
      },
      {
        $sort: { nextDueDate: 1 },
      },
    ])

    return res.status(200).json({ dueInstallments: completedInstallments })
  } catch (error) {
    console.error("Error fetching due installments:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const sendPaymentReminders = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { paymentIds } = req.body

  try {
    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({ message: "No payment IDs provided" })
    }

    const payments = await FeePayment.find({
      _id: { $in: paymentIds },
      isInstallment: true,
    }).populate("studentId", "name email")

    if (payments.length === 0) {
      return res.status(404).json({ message: "No valid payments found" })
    }

    const results = payments.map((payment) => ({
      paymentId: payment._id,
      student: payment.studentId,
      reminderSent: true,
      channel: "email",
    }))

    return res.status(200).json({
      message: `${results.length} payment reminders sent successfully`,
      results,
    })
  } catch (error) {
    console.error("Error sending payment reminders:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
const calculateNextDueDate = (): Date => {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date
}
