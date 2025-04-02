import mongoose, { Schema, Document } from "mongoose"

export interface JobPostingDocument extends Document {
  collegeId: mongoose.Types.ObjectId
  jobTitle: string
  companyName: string
  applyLink: string
  jobDescription: string
  postedBy: mongoose.Types.ObjectId
  location?: string
  jobType?: "Full-time" | "Part-time" | "Internship" | "Contract"
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}

const JobPostingSchema: Schema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    applyLink: { type: String, required: true },
    jobDescription: { type: String, required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract"],
      default: "Full-time",
    },
    deadline: { type: Date },
  },
  { timestamps: true }
)

const JobPosting = mongoose.model<JobPostingDocument>(
  "JobPosting",
  JobPostingSchema
)

export default JobPosting
