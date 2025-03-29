import { Schema, model, Document, Types } from "mongoose"

export interface IDepartment extends Document {
  collegeId: Types.ObjectId
  name: string
  students: Types.ObjectId[]
  teachers: Types.ObjectId[]
  subjects: Types.ObjectId[]
}

const DepartmentSchema: Schema = new Schema({
  collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
  name: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "User" }],
  teachers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  subjects: [{ type: Schema.Types.ObjectId, ref: "Course" }],
})

export default model<IDepartment>("Department", DepartmentSchema)
