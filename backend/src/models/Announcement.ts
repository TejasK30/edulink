import mongoose, { Schema, Document } from "mongoose"

export interface IAnnouncement extends Document {
  collegeId: mongoose.Types.ObjectId
  title: string
  content: string
  authorId: mongoose.Types.ObjectId
  authorRole: "admin" | "teacher"
  createdAt: Date
  departmentId?: mongoose.Types.ObjectId
}

const AnnouncementSchema: Schema = new Schema({
  collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, required: true },
  authorRole: { type: String, enum: ["admin", "teacher"], required: true },
  createdAt: { type: Date, default: Date.now },
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
})

export default mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema)
