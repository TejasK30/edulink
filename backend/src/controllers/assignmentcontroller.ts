import { Request, Response } from "express"
import Course from "../models/Course"
import mongoose, { Types } from "mongoose"
import Assignment from "../models/Assignment"
import User, { UserRole } from "../models/user"

export const getTeacherCourses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { teacherId } = req.params

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const courses = await Course.find({
      teacherId: new Types.ObjectId(teacherId),
    })
      .select("_id name code semesterId departmentId")
      .populate("semesterId", "name year")
      .populate("departmentId", "name")

    return res.status(200).json(courses)
  } catch (error: any) {
    console.error("Error fetching teacher courses:", error)
    res
      .status(500)
      .json({ message: "Failed to fetch courses", error: error.message })
  }
}

export const createAssignment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { teacherId } = req.params
    const { title, name, questions, dueDate, courseId } = req.body

    const teacher = await User.findById(teacherId)
    if (!teacher || teacher.role !== UserRole.TEACHER) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    if (course.teacherId?.toString() !== teacherId) {
      return res
        .status(403)
        .json({ message: "You are not assigned to this course" })
    }

    const assignment = new Assignment({
      collegeId: teacher.college,
      departmentId: teacher.department,
      courseId,
      teacherId,
      title,
      name,
      questions,
      dueDate,
    })

    await assignment.save()
    return res.status(201).json({ message: "Assignment created", assignment })
  } catch (error: any) {
    console.error("Error creating assignment:", error)
    return res
      .status(500)
      .json({ message: "Server error", error: error.message })
  }
}

export const getAssignmentsForCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { courseId } = req.params
    if (!courseId || typeof courseId !== "string") {
      return res
        .status(400)
        .json({ message: "courseId query parameter is required" })
    }

    const assignments = await Assignment.find({ courseId })
      .sort({ dueDate: 1 })
      .populate("teacherId", "name")
      .populate("courseId", "name code")

    return res.status(200).json(assignments)
  } catch (error: any) {
    console.error("Error fetching assignments:", error)
    return res
      .status(500)
      .json({ message: "Server error", error: error.message })
  }
}

export const getAssignmentById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { assignmentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment ID" })
    }

    const assignment = await Assignment.findById(assignmentId)
      .populate("teacherId", "name")
      .populate("courseId", "name code")

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    return res.status(200).json(assignment)
  } catch (error: any) {
    console.error("Error fetching assignment:", error)
    return res
      .status(500)
      .json({ message: "Server error", error: error.message })
  }
}
