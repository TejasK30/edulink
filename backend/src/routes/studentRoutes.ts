import express from "express"
import {
  bulkEnrollStudentInSemester,
  getCoursesByDepartmentId,
  getEnrolledCourses,
  getJobsByCollegeStudent,
  getStudentAssignments,
  getStudentAttendance,
  getStudentDepartment,
} from "../controllers/studentController"

const router = express.Router()

router.post("/:studentId/enroll-all", bulkEnrollStudentInSemester)
router.get("/:studentId/enrolled-courses", getEnrolledCourses)
router.get("/assignments/:studentId", getStudentAssignments)
router.get("/department/:departmentId", getStudentDepartment)
router.get("/department/:departmentId/courses", getCoursesByDepartmentId)
router.get("/attendance/:studentId", getStudentAttendance)
router.get("/jobs/:collegeId", getJobsByCollegeStudent)

export default router
