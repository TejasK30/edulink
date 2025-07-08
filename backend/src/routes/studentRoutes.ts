import express from "express"
import {
  bulkEnrollStudentInSemester,
  getCoursesByDepartmentId,
  getEnrolledCourses,
  getJobsByCollegeStudent,
  getSemestersByCollegeForStudent,
  getStudentAssignments,
  getStudentAttendance,
  getStudentDepartment,
} from "../controllers/studentController"
import { authenticate, authorizeRole } from "../middleware/auth"

const router = express.Router()

router.use(authenticate, authorizeRole("student"))
router.post("/:studentId/enroll-all", bulkEnrollStudentInSemester)
router.get("/:studentId/enrolled-courses", getEnrolledCourses)
router.get("/assignments/:studentId", getStudentAssignments)
router.get("/department/:departmentId", getStudentDepartment)
router.get("/department/:departmentId/courses", getCoursesByDepartmentId)
router.get("/attendance/:studentId", getStudentAttendance)
router.get("/jobs/:collegeId", getJobsByCollegeStudent)
router.get("/colleges/:collegeId/semesters", getSemestersByCollegeForStudent)

export default router
