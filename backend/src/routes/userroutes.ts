import { getUsersByRole } from "../controllers/usercontroller"
import { Router } from "express"

const router = Router()

router.get("/users", getUsersByRole)

export default router
