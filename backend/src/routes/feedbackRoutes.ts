import { Router } from "express"
import {
  getCollegeFeedbackAnalytics,
  getStudentFeedbacks,
  getTeacherFeedbacks,
  submitFeedback,
} from "../controllers/feedbackController"

const router = Router()

router.post("/:studentId", submitFeedback)

router.get("/student/:studentId", getStudentFeedbacks)

router.get("/teacher/:teacherId", getTeacherFeedbacks)

router.get("/analytics/admin/:userid", getCollegeFeedbackAnalytics)

export default router
