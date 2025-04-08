import { Router } from "express"
import {
  getCollegeFeedbacks,
  getStudentFeedbacks,
  getTeacherFeedbacks,
  submitFeedback,
} from "../controllers/feedbackController"

const router = Router()

router.post("/:studentId", submitFeedback)

router.get("/student/:studentId", getStudentFeedbacks)

router.get("/teacher/:teacherId", getTeacherFeedbacks)

router.get("/college", getCollegeFeedbacks)

export default router
