import express from "express"
import {
  getTeacherCourses,
  getStudentsByCourse,
  markAttendance,
} from "../controllers/attendanceController"

const router = express.Router()

router.get("/teacher/courses/:teacherId", getTeacherCourses)
router.get("/courses/:courseId/students", getStudentsByCourse)
router.post("/mark/:teacherId", markAttendance)

export default router
