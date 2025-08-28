import { Router } from "express"
import {
  getCollegeFeedbackAnalytics,
  getStudentFeedbacks,
  getTeacherFeedbacks,
  submitFeedback,
} from "../controllers/feedbackController"
import { authenticate, authorizeRole } from "../middleware/auth"

const router = Router()

router.use(authenticate)

router.post("/:studentId", authorizeRole("student"), submitFeedback)

router.get("/student/:studentId", getStudentFeedbacks)

router.get("/teacher/:teacherId", getTeacherFeedbacks)

router.get(
  "/analytics/admin/:userid",
  authorizeRole("admin"),
  getCollegeFeedbackAnalytics
)

export default router
