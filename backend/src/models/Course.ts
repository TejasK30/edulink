import mongoose, { Schema, Document } from "mongoose"

export interface ICourse extends Document {
  collegeId: mongoose.Types.ObjectId
  departmentId: mongoose.Types.ObjectId
  name: string
  code: string
  credits: number
  description?: string
  enrolledStudents: mongoose.Types.ObjectId[]
  semester?: string
  teacherId?: mongoose.Types.ObjectId
}

const CourseSchema: Schema = new Schema(
  {
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: { type: Number, required: true, default: 3 },
    description: { type: String },
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: "User" }],
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    capacity: { type: Number },
    semester: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model<ICourse>("Course", CourseSchema)
