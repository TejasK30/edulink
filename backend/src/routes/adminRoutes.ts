import { Router } from "express"
import {
  adminDashboard,
  createAnnouncement,
  createJobPosting,
  createUser,
  deleteUser,
  getAdmins,
  getAllUsers,
  getStudents,
  getTeachers,
  getUserById,
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
router.post("/jobs", createJobPosting)

export default router
