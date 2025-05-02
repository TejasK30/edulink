import { Request, Response } from "express"
import mongoose from "mongoose"
import Feedback, { FeedbackType } from "../models/feedback"
import User, { UserRole } from "../models/user"

const FEEDBACK_TYPE_TEACHER = "teacher"
const FEEDBACK_TYPE_COLLEGE = "college"

export const submitFeedback = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { studentId } = req.params
    const { teacherId, teacherFeedback, collegeFeedback } = req.body

    if (!studentId || !teacherFeedback || !collegeFeedback) {
      return res.status(400).json({
        error:
          "Missing required feedback data (studentId in URL, teacherFeedback, collegeFeedback in body)",
      })
    }
    if (
      typeof teacherFeedback !== "object" ||
      teacherFeedback === null ||
      typeof teacherFeedback.overallTeacher !== "number"
    ) {
      return res.status(400).json({
        error:
          "Invalid teacherFeedback structure or missing overallTeacher rating",
      })
    }
    if (
      typeof collegeFeedback !== "object" ||
      collegeFeedback === null ||
      typeof collegeFeedback.overallCollege !== "number"
    ) {
      return res.status(400).json({
        error:
          "Invalid collegeFeedback structure or missing overallCollege rating",
      })
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: "Invalid student ID format in URL" })
    }
    const student = await User.findById(studentId)
    if (!student || student.role !== UserRole.STUDENT) {
      return res.status(404).json({ error: "Student user not found" })
    }

    if (teacherId) {
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ error: "Invalid teacher ID format" })
      }
      const teacher = await User.findById(teacherId)
      if (!teacher || teacher.role !== UserRole.TEACHER) {
        return res
          .status(404)
          .json({ error: "Teacher user not found for the provided teacherId" })
      }
      if (teacher.college?.toString() !== student.college?.toString()) {
        return res
          .status(400)
          .json({ error: "Teacher does not belong to the student's college." })
      }
    }

    try {
      await Feedback.create({
        studentId: new mongoose.Types.ObjectId(studentId),
        teacherId: teacherId ? new mongoose.Types.ObjectId(teacherId) : null,
        feedbackType: FEEDBACK_TYPE_TEACHER,
        message: JSON.stringify(teacherFeedback),
        rating: teacherFeedback.overallTeacher,
      })

      await Feedback.create({
        studentId: new mongoose.Types.ObjectId(studentId),
        teacherId: null,
        feedbackType: FEEDBACK_TYPE_COLLEGE,
        message: JSON.stringify(collegeFeedback),
        rating: collegeFeedback.overallCollege,
      })

      return res
        .status(200)
        .json({ message: "Feedback submitted successfully" })
    } catch (error) {
      console.error("Error during feedback creation:", error)
      throw error
    }
  } catch (err: any) {
    console.error("Feedback submission error:", err)

    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.errors })
    }
    return res
      .status(500)
      .json({ error: "Error submitting feedback", details: err.message })
  }
}

export const getStudentFeedbacks = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { studentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: "Invalid student ID format" })
    }

    const student = await User.findById(studentId)
    if (!student || student.role !== UserRole.STUDENT) {
      return res.status(404).json({ error: "Student not found" })
    }

    const feedbacks = await Feedback.find({ studentId })
      .sort({ createdAt: -1 })
      .lean()

    const formattedFeedbacks = feedbacks.map((feedback) => {
      try {
        return {
          id: feedback._id,
          feedbackType: feedback.feedbackType,
          rating: feedback.rating,
          message: JSON.parse(feedback.message || "{}"),
          teacherId: feedback.teacherId,
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt,
        }
      } catch (parseError) {
        console.error(
          `Error parsing feedback message for ID ${feedback._id}:`,
          parseError
        )
        return {
          id: feedback._id,
          feedbackType: feedback.feedbackType,
          rating: feedback.rating,
          message: {
            error: "Failed to parse feedback details",
            raw: feedback.message,
          },
          teacherId: feedback.teacherId,
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt,
        }
      }
    })

    return res.status(200).json({
      feedbacks: formattedFeedbacks,
    })
  } catch (err: any) {
    console.error("Error fetching student feedbacks:", err)
    return res
      .status(500)
      .json({ error: "Error fetching student feedbacks", details: err.message })
  }
}

export const getTeacherFeedbacks = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { teacherId } = req.params

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ error: "Invalid teacher ID format" })
    }

    const teacher = await User.findById(teacherId)
    if (!teacher || teacher.role !== UserRole.TEACHER) {
      return res.status(404).json({ error: "Teacher not found" })
    }

    const feedbacks = await Feedback.find({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      feedbackType: FEEDBACK_TYPE_TEACHER,
    })
      .sort({ createdAt: -1 })
      .populate("studentId", "name")
      .lean()

    const totalFeedbacks = feedbacks.length

    const avgRating =
      totalFeedbacks > 0
        ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) /
          totalFeedbacks
        : 0

    const detailedFeedbacks = feedbacks.map((feedback) => {
      try {
        const parsedMessage = JSON.parse(feedback.message || "{}")
        return {
          id: feedback._id,
          studentId: feedback.studentId,
          rating: feedback.rating,
          details: parsedMessage,
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt,
        }
      } catch (parseError) {
        console.error(
          `Error parsing teacher feedback message for ID ${feedback._id}:`,
          parseError
        )
        return {
          id: feedback._id,
          studentId: feedback.studentId,
          rating: feedback.rating,
          details: {
            error: "Failed to parse feedback details",
            raw: feedback.message,
          },
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt,
        }
      }
    })

    return res.status(200).json({
      totalFeedbacks: totalFeedbacks,
      averageRating: parseFloat(avgRating.toFixed(1)),
      feedbacks: detailedFeedbacks,
    })
  } catch (err: any) {
    console.error("Error fetching teacher feedbacks:", err)
    return res
      .status(500)
      .json({ error: "Error fetching teacher feedbacks", details: err.message })
  }
}

interface FeedbackAnalytics {
  totalFeedbacks: number
  averageOverallRating: number
  feedbackTypeBreakdown: Array<{
    _id: FeedbackType
    count: number
    averageRating: number
  }>
  averageTeacherRating?: number
  averageCollegeRating?: number
}

export const getCollegeFeedbackAnalytics = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userid } = req.params
  console.log(userid)

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(400).json({ message: "Invalid user ID format." })
  }

  try {
    const adminUser = await User.findById(userid).select("+role college")
    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found." })
    }
    const adminCollegeId = adminUser.college

    const analyticsResult = await Feedback.aggregate<FeedbackAnalytics>([
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      {
        $unwind: "$studentInfo",
      },
      {
        $match: {
          "studentInfo.college": adminCollegeId,
        },
      },
      {
        $facet: {
          overallAnalytics: [
            {
              $group: {
                _id: null,
                totalFeedbacks: { $sum: 1 },
                averageOverallRating: { $avg: "$rating" },
              },
            },
            {
              $project: {
                _id: 0,
                totalFeedbacks: 1,
                averageOverallRating: { $round: ["$averageOverallRating", 2] },
              },
            },
          ],
          feedbackTypeBreakdown: [
            {
              $group: {
                _id: "$feedbackType",
                count: { $sum: 1 },
                averageRating: { $avg: "$rating" },
              },
            },
            {
              $project: {
                _id: 1,
                count: 1,
                averageRating: { $round: ["$averageRating", 2] },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ],
        },
      },
      {
        $project: {
          totalFeedbacks: {
            $arrayElemAt: ["$overallAnalytics.totalFeedbacks", 0],
          },
          averageOverallRating: {
            $arrayElemAt: ["$overallAnalytics.averageOverallRating", 0],
          },
          feedbackTypeBreakdown: "$feedbackTypeBreakdown",
        },
      },
    ])

    const analytics: FeedbackAnalytics = {
      totalFeedbacks: analyticsResult[0]?.totalFeedbacks || 0,
      averageOverallRating: analyticsResult[0]?.averageOverallRating || 0,
      feedbackTypeBreakdown: analyticsResult[0]?.feedbackTypeBreakdown || [],
    }

    analytics.feedbackTypeBreakdown.forEach((item) => {
      if (item._id === FeedbackType.TEACHER) {
        analytics.averageTeacherRating = item.averageRating
      } else if (item._id === FeedbackType.COLLEGE) {
        analytics.averageCollegeRating = item.averageRating
      }
    })

    res.status(200).json(analytics)
  } catch (error) {
    console.error("Error fetching feedback analytics:", error)
    res.status(500).json({ message: "Failed to fetch feedback analytics." })
  }
}
