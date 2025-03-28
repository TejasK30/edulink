import mongoose, { Schema, Document } from "mongoose"

export interface ISemester extends Document {
  collegeId: mongoose.Types.ObjectId
  name: string
  year: number
  startDate: Date
  endDate: Date
  isActive: boolean
}

const SemesterSchema: Schema = new Schema({
  collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
  name: { type: String, required: true },
  year: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
})

export default mongoose.model<ISemester>("Semester", SemesterSchema)
