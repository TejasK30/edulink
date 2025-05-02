import { Router } from "express"
import {
  adminDashboard,
  createAnnouncement,
  createJobPostingByAdmin,
  createSemester,
  createUser,
  deleteUser,
  getAdmins,
  getAllUsers,
  getDetailedUserByRole,
  getJobsByCollegeAdmin,
  getSemestersByCollege,
  getStudents,
  getTeachers,
  getUserById,
  toggleSemesterStatus,
  updateUser,
} from "../controllers/admincontroller"

const router = Router()

router.get("/users", getAllUsers)
router.get("/users/students/:collegeId", getStudents)
router.get("/users/teachers/:collegeId", getTeachers)
router.get("/users/admins/:collegeId", getAdmins)
router.get("/users/:id", getUserById)
router.post("/users/:collegeId/create", createUser)
router.put("/users/:id", updateUser)
router.delete("/users/:id", deleteUser)
router.get("/dashboard-data", adminDashboard)
router.post("/announcements/create", createAnnouncement)
router.post("/job-postings/:adminId", createJobPostingByAdmin)
router.post("/semesters/:collegId", createSemester)
router.patch("/semesters/:id", toggleSemesterStatus)
router.get("/colleges/:collegeId/semesters", getSemestersByCollege)
router.get("/jobs/:collegeId", getJobsByCollegeAdmin)
router.get("/users/:role/:id", getDetailedUserByRole)

export default router
