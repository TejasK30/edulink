import cors from "cors"
import express, { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import connectDB from "./config/db"
import adminRoutes from "./routes/adminRoutes"
import attendaceRoutes from "./routes/attendanceRoutes"
import authRoutes from "./routes/authRoutes"
import courseRoutes from "./routes/courseRoutes"
import studentRoutes from "./routes/studentRoutes"
import teacherRoutes from "./routes/teacherRoutes"
import userRoutes from "./routes/userroutes"
import announceMentRoutes from "./routes/announcementRoutes"

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
)
app.use(express.json())

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

interface JwtPayload {
  id: string
  role: "admin" | "teacher" | "student"
  collegeId?: string
}

export const authorizeRole = (
  requiredRole: "admin" | "teacher" | "student"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as JwtPayload
      req.user = decoded
      if (decoded.role !== requiredRole) {
        return res
          .status(403)
          .json({ message: "Forbidden: insufficient privileges" })
      }
      next()
    } catch (error: unknown) {
      console.error("Token verification error:", error)
      return res.status(401).json({ message: "Invalid token" })
    }
  }
}

app.use("/api/auth/", authRoutes)
app.use("/api", userRoutes)
app.use("/api/admin/", adminRoutes)
app.use("/api/courses/", courseRoutes)
app.use("/api/attendance/", attendaceRoutes)
app.use("/api/teacher/", teacherRoutes)
app.use("/api/student/", studentRoutes)
app.use("/api/announcements", announceMentRoutes)

connectDB()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
