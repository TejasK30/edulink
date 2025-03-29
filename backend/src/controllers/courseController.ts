import { Request, Response } from "express"
import Course, { ICourse } from "../models/Course"
import Semester, { ISemester } from "../models/Semester"
import User from "../models/user"
import { Types } from "mongoose"

const handleError = (res: Response, error: any): Response => {
  console.error(error)
  return res
    .status(500)
    .json({ message: "Internal server error", error: error.message })
}

export const getAllCourses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId } = req.params
    if (!collegeId) {
      return res.status(400).json({ message: "College ID is required" })
    }
    const courses = await Course.find({ collegeId }).populate(
      "teacherId",
      "name"
    )
    return res.json(courses)
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const getCoursesForAdmin = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId } = req.params
    if (!collegeId) {
      return res.status(400).json({ message: "College ID is required" })
    }
    const { departmentId, semesterId } = req.query
    const query: any = { collegeId }
    if (departmentId) query.departmentId = departmentId
    if (semesterId) query.semesterId = semesterId
    const courses = await Course.find(query).populate("teacherId", "name")
    return res.json(courses)
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const getCoursesForTeacher = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { teacherId } = req.params
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" })
    }
    const courses = await Course.find({ teacherId }).populate(
      "semesterId",
      "name year"
    )
    return res.json(courses)
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const getCoursesForStudent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { studentId } = req.params
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" })
    }
    const { semesterYear } = req.query
    let courses = await Course.find({ enrolledStudents: studentId })
      .populate("teacherId", "name")
      .populate("semesterId", "year name")
    if (semesterYear) {
      courses = courses.filter((course) => {
        const semester = course.semesterId as unknown as ISemester
        return semester && semester.year === Number(semesterYear)
      })
    }
    return res.json(courses)
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const createCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId } = req.params
    const {
      departmentId,
      semesterId,
      teacherId,
      name,
      code,
      credits,
      description,
      topics,
      enrolledStudents,
    } = req.body

    const newCourse: Partial<ICourse> = {
      collegeId: new Types.ObjectId(collegeId),
      departmentId: new Types.ObjectId(departmentId),
      semesterId: new Types.ObjectId(semesterId),
      teacherId: teacherId ? new Types.ObjectId(teacherId) : undefined,
      name,
      code,
      credits,
      description,
      topics,
      enrolledStudents,
    }

    const course = await Course.create(newCourse)
    return res.status(201).json(course)
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message })
  }
}

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params
    const updateData = req.body

    if (updateData.teacherId)
      updateData.teacherId = new Types.ObjectId(updateData.teacherId)
    if (updateData.departmentId)
      updateData.departmentId = new Types.ObjectId(updateData.departmentId)
    if (updateData.semesterId)
      updateData.semesterId = new Types.ObjectId(updateData.semesterId)

    const course = await Course.findByIdAndUpdate(id, updateData, { new: true })
    if (!course) return res.status(404).json({ message: "Course not found." })
    return res.status(200).json(course)
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message })
  }
}

export const getCourseById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "teacherId",
      "name"
    )
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    return res.json(course)
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    await Semester.findByIdAndUpdate(course.semesterId, {
      $pull: { subjects: course._id },
    })
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    )
    return res.json({ message: "Course deleted successfully" })
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const addTopicToCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $push: { topics: req.body } },
      { new: true }
    )
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    return res.json(course)
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const updateTopicInCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.courseId, "topics._id": req.params.topicId },
      {
        $set: {
          "topics.$.title": req.body.title,
          "topics.$.description": req.body.description,
        },
      },
      { new: true }
    )
    if (!course) {
      return res.status(404).json({ message: "Course or Topic not found" })
    }
    return res.json(course)
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const deleteTopicFromCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $pull: { topics: { _id: req.params.topicId } } },
      { new: true }
    )
    if (!course) {
      return res.status(404).json({ message: "Course or Topic not found" })
    }
    return res.json(course)
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const enrollStudentInCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $push: { enrolledStudents: req.params.studentId } },
      { new: true }
    )
    const student = await User.findByIdAndUpdate(
      req.params.studentId,
      { $push: { enrolledCourses: req.params.courseId } },
      { new: true }
    )
    if (!course || !student) {
      return res.status(404).json({ message: "Course or Student not found" })
    }
    return res.json({
      message: "Student enrolled successfully",
      course,
      student,
    })
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const removeStudentFromCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $pull: { enrolledStudents: req.params.studentId } },
      { new: true }
    )
    const student = await User.findByIdAndUpdate(
      req.params.studentId,
      { $pull: { enrolledCourses: req.params.courseId } },
      { new: true }
    )
    if (!course || !student) {
      return res.status(404).json({ message: "Course or Student not found" })
    }
    return res.json({
      message: "Student removed successfully",
      course,
      student,
    })
  } catch (error: any) {
    return handleError(res, error)
  }
}

export const getAvailableCourses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId, semesterId } = req.query

    if (!collegeId || !semesterId) {
      return res.status(400).json({
        message: "collegeId and semesterId query parameters are required",
      })
    }

    const collegeObjectId = new Types.ObjectId(collegeId.toString())
    const semesterObjectId = new Types.ObjectId(semesterId.toString())

    const courses = await Course.find({
      collegeId: collegeObjectId,
      semesterId: semesterObjectId,
    })

    return res.json(courses)
  } catch (error: any) {
    console.error("Error fetching courses:", error)
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message })
  }
}
