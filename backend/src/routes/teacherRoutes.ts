import { Router } from "express"
import {
  assignCourseToTeacher,
  createAssignment,
  getAssignmentById,
  getDepartmentCourses,
  getTeacherAssignments,
  getTeacherDepartments,
} from "../controllers/teacherController"

const router = Router()

router.post("/assignments/teacher/:teacherId", createAssignment)
router.get("/assignments/teacher/:teacherId", getTeacherAssignments)
router.get("/assignments/:assignmentId", getAssignmentById)
router.get("/departments/:departmentId/courses", getDepartmentCourses)
router.post("/assign-course/:teacherId", assignCourseToTeacher)
router.get("/:teacherId/departments", getTeacherDepartments)

export default router
