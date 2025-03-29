import express from "express"
import {
  bulkEnrollStudentInSemester,
  getCoursesByDepartmentId,
  getEnrolledCourses,
  getStudentAssignments,
  getStudentDepartment,
} from "../controllers/studentController"

const router = express.Router()

router.post("/:studentId/enroll-all", bulkEnrollStudentInSemester)
router.get("/:studentId/enrolled-courses", getEnrolledCourses)
router.get("/assignments/:studentId", getStudentAssignments)
router.get("/assignments/:studentId", getStudentAssignments)
router.get("/department/:departmentId", getStudentDepartment)
router.get(
  "/student/department/:departmentId/courses",
  getCoursesByDepartmentId
)

export default router
