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
import { authenticate, authorizeRole } from "../middleware/auth"

const router = Router()

router.get("/users", authenticate, authorizeRole("admin"), getAllUsers)
router.get(
  "/users/students/:collegeId",
  authenticate,
  authorizeRole("admin"),
  getStudents
)
router.get(
  "/users/teachers/:collegeId",
  authenticate,
  authorizeRole("admin"),
  getTeachers
)
router.get(
  "/users/admins/:collegeId",
  authenticate,
  authorizeRole("admin"),
  getAdmins
)
router.get("/users/:id", authenticate, authorizeRole("admin"), getUserById)
router.post(
  "/users/:collegeId/create",
  authenticate,
  authorizeRole("admin"),
  createUser
)
router.put("/users/:id", authenticate, authorizeRole("admin"), updateUser)
router.delete("/users/:id", authenticate, authorizeRole("admin"), deleteUser)

router.post(
  "/announcements/create",
  authenticate,
  authorizeRole("admin"),
  createAnnouncement
)
router.post(
  "/job-postings/:adminId",
  authenticate,
  authorizeRole("admin"),
  createJobPostingByAdmin
)
router.post(
  "/semesters/:collegId",
  authenticate,
  authorizeRole("admin"),
  createSemester
)
router.patch(
  "/semesters/:id",
  authenticate,
  authorizeRole("admin"),
  toggleSemesterStatus
)
router.get(
  "/colleges/:collegeId/semesters",
  authenticate,
  authorizeRole("admin"),
  getSemestersByCollege
)
router.get(
  "/jobs/:collegeId",
  authenticate,
  authorizeRole("admin"),
  getJobsByCollegeAdmin
)
router.get(
  "/users/:role/:id",
  authenticate,
  authorizeRole("admin"),
  getDetailedUserByRole
)

export default router
