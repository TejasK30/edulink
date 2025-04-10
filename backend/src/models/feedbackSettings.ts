import mongoose, { Schema, Document } from "mongoose"

export interface FeedbackSettingsModel extends Document {
  isFeedbackActive: boolean
  feedbackStartDate: Date
  feedbackEndDate: Date
  createdAt: Date
  updatedAt: Date
}

const FeedbackSettingsSchema: Schema = new Schema(
  {
    isFeedbackActive: {
      type: Boolean,
      default: false,
    },
    feedbackStartDate: {
      type: Date,
      required: true,
    },
    feedbackEndDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

const FeedbackSettings = mongoose.model<FeedbackSettingsModel>(
  "FeedbackSettings",
  FeedbackSettingsSchema
)
export default FeedbackSettings
