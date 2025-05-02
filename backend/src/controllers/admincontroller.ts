import { NextFunction, Request, Response } from "express"
import { z } from "zod"
import Announcement from "../models/Announcement"
import Course from "../models/Course"
import Department from "../models/Department"
import JobPosting, { JobPostingDocument } from "../models/JobPosting"
import User, { UserRole } from "../models/user"
import College from "../models/College"
import mongoose from "mongoose"
import Semester, { ISemester } from "../models/Semester"
import { Types } from "mongoose"
import Attendance from "../models/Attendance"
import Grade from "../models/Grade"
import Feedback from "../models/feedback"

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  department: z.string().optional(),
})

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]),
  department: z.string().optional(),
})

export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log(req.body)

    const validatedData = createUserSchema.parse(req.body)
    const { name, email, password, role, department } = validatedData

    const collegeId = req.params.collegeId as string
    console.log("Received collegeid:", collegeId)
    if (!collegeId) {
      return res
        .status(400)
        .json({ message: "College ID is required in the URL" })
    }

    if (
      (role === UserRole.TEACHER || role === UserRole.STUDENT) &&
      !department
    ) {
      return res
        .status(400)
        .json({ message: "Department is required for teacher and student" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" })
    }

    const collegeObjId = new mongoose.Types.ObjectId(collegeId)

    const newUser = new User({
      name,
      email,
      password,
      role,
      college: collegeObjId,
      department: role === UserRole.ADMIN ? undefined : department,
    })

    await newUser.save()

    if (role === UserRole.TEACHER || role === UserRole.STUDENT) {
      await Department.findByIdAndUpdate(
        department,
        {
          $push: {
            [role === UserRole.TEACHER ? "teachers" : "students"]: newUser._id,
          },
        },
        { new: true }
      )
    }

    let collegeField = ""
    if (role === UserRole.ADMIN) {
      collegeField = "admins"
    } else if (role === UserRole.TEACHER) {
      collegeField = "teachers"
    } else if (role === UserRole.STUDENT) {
      collegeField = "students"
    }

    await College.findByIdAndUpdate(
      collegeObjId,
      { $push: { [collegeField]: newUser._id } },
      { new: true }
    )

    return res.status(201).json(newUser)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", errors: error.errors })
    }
    console.error("Error creating user:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getStudents = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const collegeId = req.params.collegeId
    if (!collegeId) {
      return res.status(400).json({ message: "College ID is required" })
    }
    const students = await User.find({
      role: UserRole.STUDENT,
      college: collegeId,
    })
    return res.json(students)
  } catch (error: any) {
    console.error("Error fetching students:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getTeachers = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const collegeId = req.params.collegeId
    if (!collegeId) {
      return res.status(400).json({ message: "College ID is required" })
    }
    const teachers = await User.find({
      role: UserRole.TEACHER,
      college: collegeId,
    })

    return res.json(teachers)
  } catch (error: any) {
    console.error("Error fetching teachers:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getAdmins = async (req: Request, res: Response): Promise<any> => {
  try {
    const collegeId = req.params.collegeId
    if (!collegeId) {
      return res.status(400).json({ message: "College ID is required" })
    }
    const admins = await User.find({ role: UserRole.ADMIN, college: collegeId })
    return res.json(admins)
  } catch (error: any) {
    console.error("Error fetching admins:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const users = await User.find()
    return res.json(users)
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const getUserById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    return res.json(user)
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = updateUserSchema.parse(req.body)

    if (validatedData.department === "") {
      delete validatedData.department
    }

    const existingUser = await User.findById(req.params.id)
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" })
    }

    if (
      (existingUser.role === UserRole.TEACHER ||
        existingUser.role === UserRole.STUDENT) &&
      validatedData.department
    ) {
      const currentDept = (existingUser as any).department
      if (currentDept?.toString() !== validatedData.department) {
        if (currentDept) {
          await Department.findByIdAndUpdate(currentDept, {
            $pull: {
              [existingUser.role === UserRole.TEACHER
                ? "teachers"
                : "students"]: existingUser._id,
            },
          })
        }
        await Department.findByIdAndUpdate(validatedData.department, {
          $push: {
            [existingUser.role === UserRole.TEACHER ? "teachers" : "students"]:
              existingUser._id,
          },
        })
      }
    }

    const updateData: any = { ...validatedData }
    if (updateData.name) {
      updateData.name = updateData.name.trim()
    }
    if (updateData.password === "") {
      delete updateData.password
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }
    return res.json(updatedUser)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", errors: error.errors })
    }
    console.error("Error updating user:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id)
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(204).send()
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
export const adminDashboard = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const collegeId = req.user?.collegeId
    if (!collegeId || req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Unauthorized for dashboard" })
    }
    const studentCount = await User.countDocuments({
      role: UserRole.STUDENT,
      college: collegeId,
    })
    const teacherCount = await User.countDocuments({
      role: UserRole.TEACHER,
      college: collegeId,
    })
    const courseCount = await Course.countDocuments({ collegeId })
    const departmentCount = await Department.countDocuments({ collegeId })
    const recentAnnouncements = await Announcement.find({ collegeId })
      .sort({ createdAt: -1 })
      .limit(5)

    res.status(200).json({
      studentCount,
      teacherCount,
      courseCount,
      departmentCount,
      recentAnnouncements,
    })
  } catch (error: any) {
    console.error(error)
    res
      .status(500)
      .json({ message: "Server error fetching admin dashboard data" })
  }
}

export const createAnnouncement = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId, title, content, departmentId } = req.body
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId || !role || req.user?.collegeId !== collegeId) {
      return res.status(403).json({
        message: "Forbidden: Cannot add announcement to a different college",
      })
    }

    const announcement = new Announcement({
      collegeId,
      title,
      content,
      createdBy: userId,
      role,
      departmentId,
    })
    await announcement.save()
    res.status(201).json({
      message: "Announcement created successfully",
      announcementId: announcement._id,
    })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: "Server error creating announcement" })
  }
}

export const getAnnounceMents = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const collegeId = req.user?.collegeId
    if (!collegeId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const announcements = await Announcement.find({ collegeId }).sort({
      createdAt: -1,
    })
    res.status(200).json(announcements)
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: "Server error fetching announcements" })
  }
}

export const createSemester = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId } = req.params
    const { departmentId, name, year, startDate, endDate, isActive } = req.body
    if (new Date(startDate) >= new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date." })
    }
    const newSemester: Partial<ISemester> = {
      collegeId: new Types.ObjectId(collegeId),
      departmentId: new Types.ObjectId(departmentId),
      name,
      year: Number(year),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive ?? false,
      subjects: [],
    }
    const semester = await Semester.create(newSemester)
    return res.status(201).json(semester)
  } catch (error: any) {
    console.error("Error creating semester:", error)
    return res
      .status(500)
      .json({ message: "Server error", error: error.message })
  }
}

export const toggleSemesterStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params
    const { isActive } = req.body
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean." })
    }
    const semester = await Semester.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    )
    if (!semester) {
      return res.status(404).json({ message: "Semester not found." })
    }
    return res.status(200).json(semester)
  } catch (error: any) {
    console.error("Error updating semester:", error)
    return res
      .status(500)
      .json({ message: "Server error", error: error.message })
  }
}

export const getSemestersByCollege = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId } = req.params
    if (!collegeId)
      return res.status(400).json({ message: "College ID is required" })
    const semesters = await Semester.find({ collegeId })
    return res.json(semesters)
  } catch (error: any) {
    console.error(error)
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message })
  }
}

export const createJobPostingByAdmin = async (
  req: Request<
    { adminId: string },
    {},
    Omit<JobPostingDocument, "postedBy" | "role" | "createdAt">
  >,
  res: Response
): Promise<any> => {
  try {
    const { adminId } = req.params
    const { collegeId, companyName, applyLink, jobDescription } = req.body

    if (!mongoose.isValidObjectId(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID" })
    }
    if (!mongoose.isValidObjectId(collegeId)) {
      return res.status(400).json({ message: "Invalid college ID" })
    }

    const newJobPosting = new JobPosting({
      collegeId,
      companyName,
      applyLink,
      jobDescription,
      postedBy: adminId,
      role: "admin",
    })

    const savedJobPosting = await newJobPosting.save()
    return res.status(201).json(savedJobPosting)
  } catch (error: any) {
    console.error("Error creating job posting by admin:", error)
    return res.status(500).json({ message: "Failed to create job posting" })
  }
}

export const getJobsByCollegeAdmin = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId } = req.params

    if (!collegeId) {
      return res.status(400).json({ message: "College ID is required" })
    }

    const jobs = await JobPosting.find({ collegeId }).sort({ createdAt: -1 })

    if (!jobs.length) {
      return res
        .status(404)
        .json({ message: "No job postings found for this college" })
    }

    res.status(200).json(jobs)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

const ALLOWED_ROLES = ["admin", "teacher", "student"] as const
type Role = (typeof ALLOWED_ROLES)[number]
export const getDetailedUserByRole = async (
  req: Request<{ role: string; id: string }>,
  res: Response
): Promise<any> => {
  const { role, id } = req.params

  if (!ALLOWED_ROLES.includes(role as Role)) {
    return res.status(400).json({ error: `'${role}' is not valid.` })
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: `'${id}' is not a valid ID.` })
  }

  try {
    const user = await User.findById(id)
      .select("name email role departmentId createdAt updatedAt")
      .lean()
    if (!user) {
      return res.status(404).json({ error: `No ${role} found.` })
    }

    let department: { _id: string; name: string } | undefined
    if (user.department) {
      const dept = await Department.findById(user.department)
        .select("name")
        .lean()
      if (dept) {
        department = { _id: dept._id.toString(), name: dept.name }
      }
    }

    const payload: any = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      department,
    }

    if (role === "student") {
      const enrolledCourses = await Course.find({
        enrolledStudents: id,
      })
        .select("name code credits")
        .lean()
      payload.enrolledCourses = enrolledCourses.map((c) => ({
        _id: c._id.toString(),
        name: c.name,
        code: c.code,
        credits: c.credits,
      }))

      const attendance = await Attendance.find({ studentId: id })
        .populate("courseId", "name code")
        .lean()
      payload.attendance = attendance.map((a) => ({
        _id: a._id.toString(),
        courseId: {
          _id: (a.courseId as any)._id.toString(),
          name: (a.courseId as any).name,
          code: (a.courseId as any).code,
        },
        date: a.date.toISOString(),
        status: a.status,
      }))

      const grades = await Grade.find({ studentId: id })
        .populate("courseId", "name code")
        .lean()
      payload.grades = grades.map((g) => ({
        _id: g._id.toString(),
        courseId: {
          _id: (g.courseId as any)._id.toString(),
          name: (g.courseId as any).name,
          code: (g.courseId as any).code,
        },
        gradeValue: g.gradeValue,
        gradeType: g.gradeType,
        updatedAt: g.updatedAt.toISOString(),
      }))
    }

    if (role === "teacher") {
      const teachingCourses = await Course.find({ teacherId: id })
        .select("name code credits enrolledStudents")
        .lean()
      payload.teachingCourses = teachingCourses.map((c) => ({
        _id: c._id.toString(),
        name: c.name,
        code: c.code,
        credits: c.credits,
        enrolledStudents: Array.isArray(c.enrolledStudents)
          ? c.enrolledStudents.length
          : 0,
      }))

      const feedbacks = await Feedback.find({ teacherId: id })
        .select("rating message createdAt")
        .lean()
      payload.feedbacks = feedbacks.map((f) => ({
        _id: f._id.toString(),
        rating: f.rating,
        message: f.message,
        createdAt: f.createdAt.toISOString(),
      }))
    }

    return res.status(200).json(payload)
  } catch (err) {
    console.error("getUserByRole error:", err)
    return res.status(500).json({ error: "Server error fetching user." })
  }
}
