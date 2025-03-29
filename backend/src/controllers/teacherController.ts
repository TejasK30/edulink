import { Request, Response } from "express"
import Assignment from "../models/Assignment"
import { Types } from "mongoose"

export const createAssignment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      collegeId,
      departmentId,
      courseId,
      title,
      name,
      questions,
      dueDate,
    } = req.body

    const teacherId = req.params.teacherId

    if (!teacherId) {
      return res
        .status(400)
        .json({ message: "Teacher ID is required in the URL" })
    }

    if (
      !collegeId ||
      !departmentId ||
      !courseId ||
      !title ||
      !name ||
      !questions ||
      !dueDate
    ) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (!Array.isArray(questions) || questions.length !== 6) {
      return res
        .status(400)
        .json({ message: "There must be exactly 6 questions" })
    }

    const newAssignment = new Assignment({
      collegeId: new Types.ObjectId(collegeId),
      departmentId: new Types.ObjectId(departmentId),
      courseId: new Types.ObjectId(courseId),
      teacherId: new Types.ObjectId(teacherId),
      title,
      name,
      questions,
      dueDate: new Date(dueDate),
    })

    const savedAssignment = await newAssignment.save()

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment: savedAssignment,
    })
  } catch (error: any) {
    console.error("Error creating assignment:", error)
    res
      .status(500)
      .json({ message: "Failed to create assignment", error: error.message })
  }
}

export const getTeacherAssignments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const teacherId = req.params.teacherId

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" })
    }

    const assignments = await Assignment.find({ teacherId: teacherId }).sort({
      dueDate: 1,
    })

    return res.status(200).json(assignments)
  } catch (error: any) {
    console.error("Error fetching teacher assignments:", error)
    res.status(500).json({
      message: "Failed to fetch teacher assignments",
      error: error.message,
    })
  }
}

export const getAssignmentById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const assignmentId = req.params.assignmentId

    if (!Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid Assignment ID" })
    }

    const assignment = await Assignment.findById(assignmentId)

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    return res.status(200).json(assignment)
  } catch (error: any) {
    console.error("Error fetching assignment details:", error)
    res.status(500).json({
      message: "Failed to fetch assignment details",
      error: error.message,
    })
  }
}
