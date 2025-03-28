import { Request, Response } from "express"
import Course from "../models/Course"
import User from "../models/user"

export const createCourse = async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      description,
      creditHours,
      department,
      semester,
      syllabus,
      prerequisites,
      teacher,
    } = req.body

    const existingCourse = await Course.findOne({ code })
    if (existingCourse) {
      return res
        .status(400)
        .json({ message: "Course with this code already exists" })
    }

    if (teacher) {
      const teacherExists = await User.findOne({
        _id: teacher,
        role: "teacher",
      })
      if (!teacherExists) {
        return res.status(400).json({ message: "Invalid teacher" })
      }
    }

    const course = new Course({
      code,
      name,
      description,
      creditHours,
      department,
      semester,
      syllabus,
      prerequisites,
      teacher,
    })

    await course.save()

    res.status(201).json({
      message: "Course created successfully",
      course,
    })
  } catch (error: any) {
    res.status(500).json({
      message: "Course creation failed",
      error: error.message,
    })
  }
}

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find()
      .populate("teacher", "name email")
      .populate("enrolledStudents", "name email")

    res.json(courses)
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message,
    })
  }
}

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("enrolledStudents", "name email")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json(course)
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch course",
      error: error.message,
    })
  }
}

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      creditHours,
      department,
      semester,
      syllabus,
      prerequisites,
      teacher,
    } = req.body

    // Validate teacher if provided
    if (teacher) {
      const teacherExists = await User.findOne({
        _id: teacher,
        role: "teacher",
      })
      if (!teacherExists) {
        return res.status(400).json({ message: "Invalid teacher" })
      }
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        creditHours,
        department,
        semester,
        syllabus,
        prerequisites,
        teacher,
      },
      { new: true }
    )

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json({
      message: "Course updated successfully",
      course,
    })
  } catch (error: any) {
    res.status(500).json({
      message: "Course update failed",
      error: error.message,
    })
  }
}

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json({ message: "Course deleted successfully" })
  } catch (error: any) {
    res.status(500).json({
      message: "Course deletion failed",
      error: error.message,
    })
  }
}

export const enrollStudent = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params
    const studentId = req.user?.userId

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if student is already enrolled
    if (course.enrolledStudents.includes(studentId as any)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" })
    }

    course.enrolledStudents.push(studentId as any)
    await course.save()

    res.json({
      message: "Enrolled successfully",
      course,
    })
  } catch (error: any) {
    res.status(500).json({
      message: "Enrollment failed",
      error: error.message,
    })
  }
}
