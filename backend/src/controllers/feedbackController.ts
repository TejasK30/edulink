import { Request, Response } from "express"
import mongoose from "mongoose"
import Feedback from "../models/feedback"
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

export const getCollegeFeedbacks = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const feedbacks = await Feedback.find({
      feedbackType: FEEDBACK_TYPE_COLLEGE,
    })
      .sort({ createdAt: -1 })
      .populate("studentId", "name")
      .lean()

    const totalFeedbacks = feedbacks.length

    const overallAvgRating =
      totalFeedbacks > 0
        ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) /
          totalFeedbacks
        : 0

    const categorySums = {
      facilities: 0,
      campusLife: 0,
      administration: 0,
      academicEnvironment: 0,
    }
    let validFeedbacksForStats = 0

    feedbacks.forEach((feedback) => {
      try {
        const parsedMessage = JSON.parse(feedback.message || "{}")
        if (typeof parsedMessage === "object" && parsedMessage !== null) {
          categorySums.facilities += Number(parsedMessage.facilities) || 0
          categorySums.campusLife += Number(parsedMessage.campusLife) || 0
          categorySums.administration +=
            Number(parsedMessage.administration) || 0
          categorySums.academicEnvironment +=
            Number(parsedMessage.academicEnvironment) || 0
          validFeedbacksForStats++
        } else {
          console.warn(
            `Parsed message for feedback ID ${feedback._id} is not an object.`
          )
        }
      } catch (parseError) {
        console.error(
          `Error parsing college feedback message for ID ${feedback._id}:`,
          parseError
        )
      }
    })

    const statsCount = validFeedbacksForStats || 1

    const categoryAverages = {
      facilities: parseFloat((categorySums.facilities / statsCount).toFixed(1)),
      campusLife: parseFloat((categorySums.campusLife / statsCount).toFixed(1)),
      administration: parseFloat(
        (categorySums.administration / statsCount).toFixed(1)
      ),
      academicEnvironment: parseFloat(
        (categorySums.academicEnvironment / statsCount).toFixed(1)
      ),
      overall: parseFloat(overallAvgRating.toFixed(1)),
    }

    const recentFeedbacks = feedbacks.slice(0, 10).map((feedback) => {
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
          `Error parsing recent college feedback message for ID ${feedback._id}:`,
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
      averageRating: parseFloat(overallAvgRating.toFixed(1)),
      categoryAverages: categoryAverages,
      recentFeedbacks: recentFeedbacks,
    })
  } catch (err: any) {
    console.error("Error fetching college feedbacks:", err)
    return res
      .status(500)
      .json({ error: "Error fetching college feedbacks", details: err.message })
  }
}
