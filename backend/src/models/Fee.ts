import mongoose, { Schema, Document } from "mongoose"

export interface IFee extends Document {
  studentId: mongoose.Types.ObjectId
  collegeId: mongoose.Types.ObjectId
  semesterId: mongoose.Types.ObjectId
  amountDue: number
  amountPaid: number
  paymentHistory: {
    date: Date
    amount: number
    paymentMethod: string
    receiptNumber?: string
  }[]
}

const FeeSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    semesterId: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    paymentHistory: [
      {
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        paymentMethod: { type: String, required: true },
        receiptNumber: { type: String },
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.model<IFee>("Fee", FeeSchema)
