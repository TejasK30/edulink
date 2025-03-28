import mongoose, { Schema, Document } from "mongoose"

export interface IDepartment extends Document {
  collegeId: mongoose.Types.ObjectId
  name: string
  students: mongoose.Types.ObjectId[]
  teachers: mongoose.Types.ObjectId[]
}

const DepartmentSchema: Schema = new Schema({
  collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
  name: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "User" }],
  teachers: [{ type: Schema.Types.ObjectId, ref: "User" }],
})

export default mongoose.model<IDepartment>("Department", DepartmentSchema)
