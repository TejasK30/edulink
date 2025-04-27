import mongoose, { Schema, Document, Types } from "mongoose"

export enum FeeType {
  TUITION = "tuition",
  HOSTEL = "hostel",
  EXAM = "exam",
}

export enum FeeStatus {
  PENDING = "pending",
  PAID = "paid",
  OVERDUE = "overdue",
}

export const FeeAmounts: Record<FeeType, number> = {
  [FeeType.TUITION]: 50000,
  [FeeType.HOSTEL]: 10000,
  [FeeType.EXAM]: 2000,
}

export interface IFeeRecord extends Document {
  studentId: Types.ObjectId
  collegeId: Types.ObjectId
  semesterId: Types.ObjectId
  feeType: FeeType
  amountDue: number
  amountPaid: number
  status: FeeStatus
  dueDate: Date
  paymentDate?: Date
  paymentMethod?: string
  transactionId?: string
  receiptPdf?: Buffer
  createdAt?: Date
  updatedAt?: Date
}

const FeeRecordSchema: Schema = new Schema(
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
      index: true,
    },
    feeType: {
      type: String,
      enum: Object.values(FeeType),
      required: true,
      index: true,
    },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(FeeStatus),
      default: FeeStatus.PENDING,
      index: true,
    },
    dueDate: { type: Date, required: true },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
    transactionId: { type: String, unique: true, sparse: true },
    receiptPdf: { type: Buffer },
  },
  { timestamps: true }
)

FeeRecordSchema.index(
  { studentId: 1, semesterId: 1, feeType: 1 },
  { unique: true }
)

export default mongoose.model<IFeeRecord>("FeeRecord", FeeRecordSchema)
