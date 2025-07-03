import cors from "cors"
import cookieParser from "cookie-parser"
import express from "express"
import connectDB from "./config/db"
import { JwtPayload } from "./middleware/auth"
import adminRoutes from "./routes/adminRoutes"
import announceMentRoutes from "./routes/announcementRoutes"
import assignmentRoutes from "./routes/assignmentRoutes"
import attendaceRoutes from "./routes/attendanceRoutes"
import authRoutes from "./routes/authRoutes"
import courseRoutes from "./routes/courseRoutes"
import dashboardRoutes from "./routes/dashboardRoutes"
import feedbackRoutes from "./routes/feedbackRoutes"
import feeRoutes from "./routes/feeRoutes"
import studentRoutes from "./routes/studentRoutes"
import teacherRoutes from "./routes/teacherRoutes"
import userRoutes from "./routes/userroutes"

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
)

app.use(cookieParser())

app.use(express.json())
connectDB()

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

app.get("/test-cookie", (req, res) => {
  res.cookie("test-token", "123abc", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60,
  })
  res.json({ success: true })
})

app.use("/api/auth/", authRoutes)
app.use("/api", userRoutes)
app.use("/api/dashboard/", dashboardRoutes)
app.use("/api/admin/", adminRoutes)
app.use("/api/courses/", courseRoutes)
app.use("/api/attendance/", attendaceRoutes)
app.use("/api/teacher/", teacherRoutes)
app.use("/api/assignments/", assignmentRoutes)
app.use("/api/student/", studentRoutes)
app.use("/api/announcements", announceMentRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/fee", feeRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
