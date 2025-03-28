import { Request, Response } from "express"
import { z } from "zod"
import Announcement from "../models/Announcement"
import Course from "../models/Course"
import Department from "../models/Department"
import JobPosting from "../models/JobPosting"
import User, { UserRole } from "../models/user"
import College from "../models/College"
import mongoose from "mongoose"

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]).optional(),
  college: z.string().optional(),
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
    const validatedData = updateUserSchema.partial().parse(req.body)
    const { name, ...rest } = validatedData
    const updateData: any = { ...rest }
    if (name) {
      updateData.name = name.trim()
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
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

export const createJobPosting = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { companyName, applyLink, jobDescription, collegeId } = req.body
    const postedBy = req.user?.id
    const role = req.user?.role

    if (
      !postedBy ||
      (role !== "admin" && role !== "teacher") ||
      req.user?.collegeId !== collegeId
    ) {
      return res.status(403).json({
        message: "Forbidden: Cannot post job for a different college",
      })
    }

    const newJob = new JobPosting({
      collegeId,
      companyName,
      applyLink,
      jobDescription,
      postedBy,
      role,
    })

    await newJob.save()
    res
      .status(201)
      .json({ message: "Job posted successfully", jobId: newJob._id })
  } catch (error: any) {
    console.error("Error posting job:", error)
    res.status(500).json({ message: "Server error while posting job" })
  }
}
