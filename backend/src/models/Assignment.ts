import { Schema, model, Document, Types } from "mongoose"

export interface IAssignment extends Document {
  collegeId: Types.ObjectId
  departmentId: Types.ObjectId
  courseId: Types.ObjectId
  teacherId: Types.ObjectId
  title: string
  name: string
  questions: string[]
  dueDate: Date
}

const AssignmentSchema: Schema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    questions: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length === 6,
        message: "There must be exactly 6 questions",
      },
    },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
)

export default model<IAssignment>("Assignment", AssignmentSchema)
