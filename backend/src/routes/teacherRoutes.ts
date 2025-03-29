import { Router } from "express"
import {
  createAssignment,
  getAssignmentById,
  getTeacherAssignments,
} from "../controllers/teacherController"

const router = Router()

router.post("/assignments/teacher/:teacherId", createAssignment)
router.get("/assignments/teacher/:teacherId", getTeacherAssignments)
router.get("/assignments/:assignmentId", getAssignmentById)

export default router
