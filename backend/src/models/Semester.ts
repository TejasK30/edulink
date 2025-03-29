import { Schema, model, Document, Types } from "mongoose"

export interface ISemester extends Document {
  collegeId: Types.ObjectId
  departmentId: Types.ObjectId
  name: string
  year: number
  startDate: Date
  endDate: Date
  isActive: boolean
  subjects: Types.ObjectId[]
}

const SemesterSchema: Schema = new Schema({
  collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  name: { type: String, required: true },
  year: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  subjects: [{ type: Schema.Types.ObjectId, ref: "Course" }],
})

export default model<ISemester>("Semester", SemesterSchema)
