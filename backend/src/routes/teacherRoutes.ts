import {
  getTeacherCourse,
  getTeacherDepartments,
  markAttendance,
} from "controllers/teacherController"
import {
  createAnnouncement,
  createJobPosting,
  getAnnounceMents,
} from "../controllers/admincontroller"
import { Router } from "express"

const router = Router()

router.post("/announcements/create", createAnnouncement)
router.get("/announcements/get", getAnnounceMents)
router.post("/jobs", createJobPosting)
// get courses for teacher
router.get("/departments", getTeacherDepartments)
//get teacher course from department
router.get("/courses/:departmentId", getTeacherCourse)
//mark attendance
router.post("attendance/mark", markAttendance)

export default router
