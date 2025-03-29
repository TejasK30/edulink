import { Schema, model, Document, Types } from "mongoose"

export interface Topic {
  title: string
  description: string
}

export interface ICourse extends Document {
  collegeId: Types.ObjectId
  departmentId: Types.ObjectId
  semesterId: Types.ObjectId
  teacherId: Types.ObjectId
  name: string
  code: string
  credits: number
  description?: string
  topics: Topic[]
  enrolledStudents: Types.ObjectId[]
}

const TopicSchema = new Schema<Topic>({
  title: { type: String, required: true },
  description: { type: String, required: true },
})

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
    semesterId: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    teacherId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: { type: Number, required: true, default: 3 },
    description: { type: String },
    topics: { type: [TopicSchema], default: [] },
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: "User" }],
    capacity: { type: Number },
  },
  { timestamps: true }
)

export default model<ICourse>("Course", CourseSchema)
