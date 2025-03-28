import mongoose, { Schema, Document } from "mongoose"

export interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId
  assignmentId: mongoose.Types.ObjectId
  submissionDate: Date
  submissionDetails?: string
  grade?: number
  feedback?: string
}

const SubmissionSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  submissionDate: { type: Date, default: Date.now },
  submissionDetails: { type: String },
  grade: { type: Number },
  feedback: { type: String },
})

SubmissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true })

export default mongoose.model<ISubmission>("Submission", SubmissionSchema)
