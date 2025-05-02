import { Document, Schema, Types, model } from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { PaymentMethod } from "../utils/paymentGateway"

export enum FeeType {
  TUITION = "tuition",
  EXAM = "exam",
  HOSTEL = "hostel",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IFeePayment extends Document {
  studentId: Types.ObjectId
  collegeId: Types.ObjectId
  departmentId: Types.ObjectId
  amountPaid: number
  currency: string
  paymentDate: Date
  feeDetails: {
    feeType: FeeType
    amount: number
  }[]
  transactionId: string
  paymentStatus: PaymentStatus
  receiptPath: string
  receiptSent: boolean
  isInstallment: boolean
  installmentNumber?: number
  totalInstallments?: number
  remainingAmount?: number
  paymentMethod?: PaymentMethod
  gatewayReference?: string
  paymentAttempts?: number
  failureReason?: string
}

const FeePaymentSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      enum: ["INR"],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    feeDetails: [
      {
        feeType: {
          type: String,
          enum: Object.values(FeeType),
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    transactionId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    receiptPath: {
      type: String,
    },
    receiptSent: {
      type: Boolean,
      default: false,
    },
    isInstallment: {
      type: Boolean,
      default: false,
    },
    installmentNumber: {
      type: Number,
    },
    totalInstallments: {
      type: Number,
    },
    remainingAmount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
    gatewayReference: {
      type: String,
    },
    paymentAttempts: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
    },
  },
  { timestamps: true }
)

export default model<IFeePayment>("FeePayment", FeePaymentSchema)
