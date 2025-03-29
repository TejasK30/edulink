import { Router } from "express"
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addTopicToCourse,
  updateTopicInCourse,
  deleteTopicFromCourse,
  enrollStudentInCourse,
  removeStudentFromCourse,
  getCoursesForAdmin,
  getCoursesForTeacher,
  getAvailableCourses,
} from "../controllers/courseController"

const router = Router()

router.post("/create/:collegeId", createCourse)
router.get("/available", getAvailableCourses)
router.get("/college/:collegeId", getAllCourses)
router.get("/college/:collegeId", getCoursesForAdmin)
router.get("/teacher/:teacherId", getCoursesForTeacher)
router.get("/:id", getCourseById)
router.put("/:id", updateCourse)
router.delete("/:id", deleteCourse)

router.post("/:courseId/topics", addTopicToCourse)
router.put("/:courseId/topics/:topicId", updateTopicInCourse)
router.delete("/:courseId/topics/:topicId", deleteTopicFromCourse)

router.post("/:courseId/enroll/:studentId", enrollStudentInCourse)
router.delete("/:courseId/enroll/:studentId", removeStudentFromCourse)

export default router
