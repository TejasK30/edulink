import { authenticate, authorizeRole } from "../middleware/auth"
import {
  createAssignment,
  getAssignmentById,
  getAssignmentsForCourse,
  getTeacherCourses,
} from "../controllers/assignmentcontroller"
import { Router } from "express"

const router = Router()

router.use(authenticate)

router.get("/courses/teacher/:teacherId", getTeacherCourses)
router.post("/teacher/:teacherId", authorizeRole("teacher"), createAssignment)
router.get("/course/:courseId", getAssignmentsForCourse)
router.get("/:assignmentId", getAssignmentById)

export default router
