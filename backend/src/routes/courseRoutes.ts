import { Router } from "express"
import {
  addTopicToCourse,
  createCourse,
  deleteCourse,
  deleteTopicFromCourse,
  enrollStudentInCourse,
  getAvailableCourses,
  getCourseById,
  getCoursesForAdmin,
  getCoursesForTeacher,
  getDepartmentsByCollege,
  getSemestersByCollege,
  getUsers,
  removeStudentFromCourse,
  toggleSemesterStatus,
  updateCourse,
  updateTopicInCourse,
} from "../controllers/courseController"

const router = Router()

router.get("/departments/:collegeId", getDepartmentsByCollege)
router.get("/semesters/:collegeId", getSemestersByCollege)
router.get("/college-courses/:collegeId", getCoursesForAdmin)
router.get("/users", getUsers)

router.post("/create/:collegeId", createCourse)
router.get("/available", getAvailableCourses)
router.get("/college/admin/:collegeId", getCoursesForAdmin)
router.get("/teacher/:teacherId", getCoursesForTeacher)
router.get("/:id", getCourseById)
router.put("/:id", updateCourse)
router.delete("/:id", deleteCourse)

router.post("/:courseId/topics", addTopicToCourse)
router.put("/:courseId/topics/:topicId", updateTopicInCourse)
router.delete("/:courseId/topics/:topicId", deleteTopicFromCourse)

router.post("/:courseId/enroll/:studentId", enrollStudentInCourse)
router.delete("/:courseId/enroll/:studentId", removeStudentFromCourse)

router.patch("/semesters/:id", toggleSemesterStatus)

export default router
