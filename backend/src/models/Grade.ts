import mongoose, { Schema, Document } from "mongoose"

export interface IGrade extends Document {
  studentId: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  assignmentId?: mongoose.Types.ObjectId
  gradeValue: number
  gradeType: "assignment" | "exam" | "other"
  notes?: string
}

const GradeSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment" },
  gradeValue: { type: Number, required: true },
  gradeType: {
    type: String,
    enum: ["assignment", "exam", "other"],
    required: true,
  },
  notes: { type: String },
})

export default mongoose.model<IGrade>("Grade", GradeSchema)
