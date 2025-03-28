import mongoose, { Schema, Document } from "mongoose"

export interface IAssignment extends Document {
  courseId: mongoose.Types.ObjectId
  title: string
  description?: string
  dueDate: Date
  totalMarks?: number
  submissionType: "online" | "offline"
}

const AssignmentSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number },
  submissionType: {
    type: String,
    enum: ["online", "offline"],
    default: "online",
  },
})

export default mongoose.model<IAssignment>("Assignment", AssignmentSchema)
