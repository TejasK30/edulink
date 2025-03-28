import mongoose, { Schema, Document } from "mongoose"

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  semesterId: mongoose.Types.ObjectId
  enrollmentDate: Date
  grade?: string
}

const EnrollmentSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  semesterId: { type: Schema.Types.ObjectId, ref: "Semester", required: true },
  enrollmentDate: { type: Date, default: Date.now },
  grade: { type: String },
})

EnrollmentSchema.index(
  { studentId: 1, courseId: 1, semesterId: 1 },
  { unique: true }
)

export default mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema)
