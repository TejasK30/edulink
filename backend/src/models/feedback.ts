import mongoose, { Schema, Document } from "mongoose"

export enum FeedbackType {
  TEACHER = "teacher",
  COLLEGE = "college",
}

export interface FeedbackModel extends Document {
  studentId: mongoose.Types.ObjectId
  teacherId?: mongoose.Types.ObjectId
  feedbackType: FeedbackType
  message: string
  rating: number
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    feedbackType: {
      type: String,
      enum: Object.values(FeedbackType),
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
)

const Feedback = mongoose.model<FeedbackModel>("Feedback", FeedbackSchema)
export default Feedback
