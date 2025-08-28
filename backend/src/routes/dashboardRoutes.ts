import express from "express"
import {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController"
import { authenticate, authorizeRole } from "../middleware/auth"

const router = express.Router()

router.use(authenticate)

router.get("/student", authorizeRole("student"), getStudentDashboard)

router.get("/teacher", authorizeRole("teacher"), getTeacherDashboard)

router.get("/admin", authorizeRole("admin"), getAdminDashboard)

export default router
