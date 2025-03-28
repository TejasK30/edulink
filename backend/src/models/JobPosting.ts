import mongoose, { Schema, Document } from "mongoose"

export interface JobPostingDocument extends Document {
  collegeId: mongoose.Types.ObjectId
  companyName: string
  applyLink: string
  jobDescription: string
  postedBy: mongoose.Types.ObjectId
  role: "admin" | "teacher"
  createdAt: Date
}

const JobPostingSchema: Schema = new Schema({
  collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
  companyName: { type: String, required: true },
  applyLink: { type: String, required: true },
  jobDescription: { type: String, required: true },
  postedBy: { type: Schema.Types.ObjectId, required: true, refPath: "role" },
  role: { type: String, enum: ["admin", "teacher"], required: true },
  createdAt: { type: Date, default: Date.now },
})

const JobPosting = mongoose.model<JobPostingDocument>(
  "JobPosting",
  JobPostingSchema
)

export default JobPosting
