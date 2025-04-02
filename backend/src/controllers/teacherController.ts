import { NextFunction, Request, Response } from "express"
import Assignment from "../models/Assignment"
import mongoose, { Types } from "mongoose"
import Course from "../models/Course"
import User, { UserRole } from "../models/user"
import Department from "../models/Department"
import Grade from "../models/Grade"
import JobPosting from "../models/JobPosting"

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

export const getDepartmentCourses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { departmentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" })
    }

    const courses = await Course.find({
      departmentId: departmentId,
    })

    return res.status(200).json(courses)
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message })
  }
}
export const assignCourseToTeacher = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { teacherId } = req.params
    const { courseId } = req.body

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" })
    }

    const teacher = await User.findById(teacherId)
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    if (teacher.role !== UserRole.TEACHER) {
      return res.status(403).json({ message: "User is not a teacher" })
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { teacherId: teacherId },
      { new: true }
    )

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" })
    }

    await Department.findByIdAndUpdate(updatedCourse.departmentId, {
      $addToSet: { teachers: teacherId },
    })

    res.status(200).json({
      message: "Course assigned successfully",
      course: updatedCourse,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}

export const getTeacherDepartments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { teacherId } = req.params

    const teacher = await User.findById(teacherId)
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    if (teacher.role !== UserRole.TEACHER) {
      return res.status(403).json({ message: "User is not a teacher" })
    }

    const departments = await Department.find({
      collegeId: teacher.college,
    })

    res.status(200).json(departments)
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}

export const gradeStudentsInCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { teacherId } = req.params
    const { courseId, gradeType, assignmentId, grades } = req.body

    console.log("Request Body:", req.body)

    const teacher = await User.findById(teacherId)
    if (!teacher || teacher.role !== UserRole.TEACHER) {
      return res.status(403).json({ message: "Unauthorized", success: false })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found", success: false })
    }
    if (course.teacherId?.toString() !== teacherId) {
      return res.status(403).json({
        message: "You are not assigned to this course",
        success: false,
      })
    }

    if (gradeType === "assignment" && !assignmentId) {
      return res.status(400).json({
        message: "Assignment ID is required for assignment grading",
        success: false,
      })
    }

    const createdGrades = []
    for (const entry of grades) {
      const gradeDoc = new Grade({
        studentId: entry.studentId,
        collegeId: teacher.college,
        courseId,
        assignmentId: gradeType === "assignment" ? assignmentId : undefined,
        teacherId: teacherId,
        gradeValue: entry.gradeValue,
        gradeType,
        notes: entry.notes,
      })
      await gradeDoc.save()
      createdGrades.push(gradeDoc)
    }

    return res.status(201).json({
      success: true,
      message: "Grades assigned successfully",
      grades: createdGrades,
    })
  } catch (error: any) {
    console.error("Error assigning grades:", error)
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message })
  }
}

export const getEnrolledStudentsForCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { courseId } = req.params
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" })
    }
    const course = await Course.findById(courseId).populate(
      "enrolledStudents",
      "name email"
    )
    if (!course) return res.status(404).json({ message: "Course not found" })
    return res.status(200).json(course.enrolledStudents)
  } catch (error: any) {
    console.error("Error fetching enrolled students:", error)
    return res
      .status(500)
      .json({ message: "Server error", error: error.message })
  }
}

export const createJobPostingTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { teacherId } = req.params

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" })
    }

    const {
      collegeId,
      jobTitle,
      companyName,
      applyLink,
      jobDescription,
      location,
      jobType,
      deadline,
    } = req.body

    const newJobPosting = new JobPosting({
      collegeId,
      jobTitle,
      companyName,
      applyLink,
      jobDescription,
      postedBy: teacherId,
      location,
      jobType,
      deadline,
    })

    const savedJobPosting = await newJobPosting.save()

    return res.status(201).json(savedJobPosting)
  } catch (error) {
    next(error)
  }
}

export const getJobsByCollegeTeacher = async (
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
