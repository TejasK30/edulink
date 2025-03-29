import {
  createAssignment,
  getAssignmentById,
  getAssignmentsForCourse,
  getTeacherCourses,
} from "../controllers/assignmentcontroller"
import { Router } from "express"

const router = Router()

router.get("/courses/teacher/:teacherId", getTeacherCourses)
router.post("/teacher/:teacherId", createAssignment)
router.get("/course/:courseId", getAssignmentsForCourse)
router.get("/:assignmentId", getAssignmentById)

export default router
