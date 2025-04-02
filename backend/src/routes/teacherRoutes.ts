import { Router } from "express"
import {
  assignCourseToTeacher,
  createAssignment,
  getAssignmentById,
  getDepartmentCourses,
  getEnrolledStudentsForCourse,
  getTeacherAssignments,
  getTeacherDepartments,
  gradeStudentsInCourse,
} from "../controllers/teacherController"
import { getTeacherCourses } from "../controllers/assignmentcontroller"

const router = Router()

router.post("/:teacherId", createAssignment)
router.post("/grade-students/:teacherId", gradeStudentsInCourse)
router.get("/courses/teacher/:teacherId", getTeacherCourses)
router.get("/assignments/teacher/:teacherId", getTeacherAssignments)
router.get("/assignments/:assignmentId", getAssignmentById)
router.get("/departments/:departmentId/courses", getDepartmentCourses)
router.post("/assign-course/:teacherId", assignCourseToTeacher)
router.get("/:teacherId/departments", getTeacherDepartments)
router.get("/courses/:courseId/enrolled-students", getEnrolledStudentsForCourse)

export default router
