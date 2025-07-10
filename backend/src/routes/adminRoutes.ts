import { Router } from "express"
import {
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
import { authenticate, authorizeRole } from "../middleware/auth"

const router = Router()

// Apply to all routes below:
router.use(authenticate, authorizeRole("admin"))

// User management
router.get("/users", getAllUsers)
router.get("/users/students/:collegeId", getStudents)
router.get("/users/teachers/:collegeId", getTeachers)
router.get("/users/admins/:collegeId", getAdmins)
router.get("/users/:id", getUserById)
router.post("/users/:collegeId/create", createUser)
router.put("/users/:id", updateUser)
router.delete("/users/:id", deleteUser)

// Announcements & job postings
router.post("/announcements/create", createAnnouncement)
router.post("/job-postings/:adminId", createJobPostingByAdmin)

// Semesters
router.post("/semesters/:collegeId", createSemester)
router.patch("/semesters/:id", toggleSemesterStatus)
router.get("/colleges/:collegeId/semesters", getSemestersByCollege)

// Job board for this college
router.get("/jobs/:collegeId", getJobsByCollegeAdmin)

// Detailed user by role
router.get("/users/:role/:id", getDetailedUserByRole)

export default router
