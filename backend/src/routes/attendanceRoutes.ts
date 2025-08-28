import express from "express"
import {
  getTeacherCourses,
  getStudentsByCourse,
  markAttendance,
} from "../controllers/attendanceController"
import { authenticate, authorizeRole } from "../middleware/auth"

const router = express.Router()

router.use(authenticate, authorizeRole("teacher"))

router.get("/teacher/courses/:teacherId", getTeacherCourses)
router.get("/courses/:courseId/students", getStudentsByCourse)
router.post("/mark/:teacherId", markAttendance)

export default router
