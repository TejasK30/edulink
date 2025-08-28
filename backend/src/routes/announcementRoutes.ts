import express from "express"
import {
  createAnnouncement,
  getAnnouncements,
} from "../controllers/announcementController"
import { authenticate, authorizeRole } from "../middleware/auth"

const router = express.Router()

router.post(
  "/:userId",
  authenticate,
  authorizeRole(["admin", "teacher"]),
  createAnnouncement
)

router.get("/:collegeId", getAnnouncements)

export default router
