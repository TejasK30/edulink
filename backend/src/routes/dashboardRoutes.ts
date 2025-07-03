import express from "express"
import {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController"
import { authenticate } from "../middleware/auth"

const router = express.Router()

router.get("/student/:userId", authenticate, getStudentDashboard)

router.get("/teacher/:userId", authenticate, getTeacherDashboard)

router.get("/admin", authenticate, getAdminDashboard)

export default router
