import { getAnnounceMents } from "controllers/admincontroller"
import { Router } from "express"

const router = Router()

router.get("/announcements/get", getAnnounceMents)
router.get("/attendance/get", getAnnounceMents)

export default router
