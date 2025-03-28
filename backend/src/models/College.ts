import mongoose, { Schema, Document } from "mongoose"

export interface ICollege extends Document {
  collegeName: string
  collegeAddress: string
  departments: mongoose.Types.ObjectId[]
  admins: mongoose.Types.ObjectId[]
  teachers: mongoose.Types.ObjectId[]
  students: mongoose.Types.ObjectId[]
}

const CollegeSchema: Schema = new Schema({
  collegeName: { type: String, required: true, unique: true },
  collegeAddress: { type: String, required: true },
  departments: [{ type: Schema.Types.ObjectId, ref: "Department" }],
  admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
  teachers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  students: [{ type: Schema.Types.ObjectId, ref: "User" }],
})

export default mongoose.model<ICollege>("College", CollegeSchema)
