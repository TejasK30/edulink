import express from "express"
import {
  createAnnouncement,
  getAnnouncements,
} from "../controllers/announcementController"

const router = express.Router()

router.post("/:userId", createAnnouncement)

router.get("/:collegeId", getAnnouncements)

export default router
