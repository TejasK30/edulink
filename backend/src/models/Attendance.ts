import { Schema, model, Document, Types } from "mongoose"

export interface AttendanceDocument extends Document {
  collegeId: Types.ObjectId
  departmentId: Types.ObjectId
  courseId: Types.ObjectId
  studentId: Types.ObjectId
  teacherId: Types.ObjectId
  date: Date
  status: "present" | "absent"
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema: Schema = new Schema({
  collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["present", "absent"], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Attendance = model<AttendanceDocument>("Attendance", AttendanceSchema)
export default Attendance
