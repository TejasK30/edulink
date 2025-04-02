import { Schema, model, Document, Types } from "mongoose"

export interface IGrade extends Document {
  studentId: Types.ObjectId
  collegeId: Types.ObjectId
  courseId: Types.ObjectId
  assignmentId?: Types.ObjectId
  teacherId: Types.ObjectId
  gradeValue: number
  gradeType: "assignment" | "exam"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const GradeSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      default: null,
    },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gradeValue: { type: Number, required: true, min: 0, max: 100 },
    gradeType: { type: String, enum: ["assignment", "exam"], required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
)

export default model<IGrade>("Grade", GradeSchema)
