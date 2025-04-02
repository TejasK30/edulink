import express from "express"
import {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController"

const router = express.Router()

router.get("/student/:userId", getStudentDashboard)

router.get("/teacher/:userId", getTeacherDashboard)

router.get("/admin/:userId", getAdminDashboard)

export default router
