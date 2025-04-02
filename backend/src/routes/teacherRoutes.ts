import { Router } from "express"
import { getTeacherCourses } from "../controllers/assignmentcontroller"
import {
  assignCourseToTeacher,
  createAssignment,
  createJobPostingTeacher,
  getAssignmentById,
  getDepartmentCourses,
  getEnrolledStudentsForCourse,
  getJobsByCollegeTeacher,
  getTeacherAssignments,
  getTeacherDepartments,
  gradeStudentsInCourse,
} from "../controllers/teacherController"

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
router.post("/job-postings/:teacherId", createJobPostingTeacher)
router.get("/jobs/:collegeId", getJobsByCollegeTeacher)

export default router
