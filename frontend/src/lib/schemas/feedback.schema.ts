import { z } from "zod"

export const feedbackSchema = z.object({
  teacherFeedback: z.object({
    clarity: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    expertise: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    engagement: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    punctuality: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    assessment: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    subjectContent: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    overallTeacher: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    teacherComment: z.string().trim().optional(),
  }),
  collegeFeedback: z.object({
    facilities: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    campusLife: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    administration: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    academicEnvironment: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    overallCollege: z.coerce
      .number()
      .min(1, "Rating must be 1-5")
      .max(5, "Rating must be 1-5")
      .optional(),
    collegeComment: z.string().trim().optional(),
  }),
})
