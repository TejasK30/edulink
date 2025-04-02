import { Request, Response } from "express"
import Announcement, { IAnnouncement } from "../models/Announcement"
import User, { UserRole } from "../models/user"
import mongoose from "mongoose"

export const createAnnouncement = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params
    const { title, content } = req.body

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can create announcements",
      })
    }

    const announcementData: Partial<IAnnouncement> = {
      title,
      content,
      authorId: new mongoose.Types.ObjectId(userId),
      authorRole: user.role === UserRole.ADMIN ? "admin" : "teacher",
      collegeId: user.college,
    }

    const announcement = new Announcement(announcementData)
    await announcement.save()

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

export const getAnnouncements = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    if (!collegeId || !mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID",
      })
    }

    const total = await Announcement.countDocuments({ collegeId: collegeId })
    const announcements = await Announcement.find({ collegeId: collegeId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("authorId", "name")
      .populate("departmentId", "name")
      .populate("collegeId", "name")

    return res.status(200).json({
      success: true,
      data: announcements,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
