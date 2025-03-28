import express from "express"
const router = express.Router()
import {
  loginUser,
  registerUser,
  registerAdminWithCollege,
  getColleges,
  logoutUser,
  getDepartmentsByCollege,
} from "../controllers/authcontrollers"

router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.post("/register", registerUser)
router.post("/register/admin", registerAdminWithCollege)
router.get("/colleges", getColleges)
router.get("/colleges/:collegeId/departments", getDepartmentsByCollege)

export default router
