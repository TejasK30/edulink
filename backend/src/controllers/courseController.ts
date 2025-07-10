import { Request, Response } from "express"
import Course, { ICourse } from "../models/Course"
import Semester, { ISemester } from "../models/Semester"
import User, { UserRole } from "../models/user"
import mongoose, { Types } from "mongoose"
import Department from "../models/Department"

const handleError = (res: Response, error: any): Response => {
  console.error(error)
  return res
    .status(500)
    .json({ message: "Internal server error", error: error.message })
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

    const query: any = {
      collegeId: new Types.ObjectId(collegeId),
    }

    if (departmentId)
      query.departmentId = new Types.ObjectId(departmentId as string)
    if (semesterId) query.semesterId = new Types.ObjectId(semesterId as string)

    const courses = await Course.find(query)
      .populate("teacherId", "name")
      .populate("departmentId", "name")
      .populate("semesterId", "name year")
      .lean()

    const result = courses.map((course: any) => {
      let departmentId: string | null = null
      let departmentName: string = "Unknown"

      if (course.departmentId) {
        if (
          typeof course.departmentId === "object" &&
          course.departmentId._id
        ) {
          departmentId = course.departmentId._id.toString()
          departmentName = course.departmentId.name || "Unknown"
        } else {
          departmentId = course.departmentId.toString()
        }
      }

      let semesterId: string | null = null
      let semesterName: string = "Unknown"

      if (course.semesterId) {
        if (typeof course.semesterId === "object" && course.semesterId._id) {
          semesterId = course.semesterId._id.toString()
          semesterName =
            course.semesterId.name && course.semesterId.year
              ? `${course.semesterId.name} ${course.semesterId.year}`
              : "Unknown"
        } else {
          semesterId = course.semesterId.toString()
        }
      }

      let teacherId: string | null = null
      let teacherName: string | null = null

      if (course.teacherId) {
        if (typeof course.teacherId === "object" && course.teacherId._id) {
          teacherId = course.teacherId._id.toString()
          teacherName = course.teacherId.name || null
        } else {
          teacherId = course.teacherId.toString()
        }
      }

      return {
        _id: course._id.toString(),
        name: course.name,
        code: course.code,
        credits: course.credits,
        description: course.description || "",
        departmentId,
        departmentName,
        semesterId,
        semesterName,
        teacherId,
        teacherName,
      }
    })

    return res.json(result)
  } catch (error: any) {
    console.error("Error fetching courses:", error)
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
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

    await Department.findByIdAndUpdate(departmentId, {
      $push: { subjects: course._id },
    })

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

export const getDepartmentsByCollege = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId } = req.params
    const departments = await Department.find({
      collegeId: new mongoose.Types.ObjectId(collegeId),
    }).select("_id name")
    return res.status(200).json({ data: departments, success: true })
  } catch (error: any) {
    console.error("Error fetching departments by college:", error)
    return res
      .status(500)
      .json({ message: "Internal server error", success: false })
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
    const semesters = await Semester.find({ collegeId }).select("_id name year")
    return res.json(semesters)
  } catch (error: any) {
    console.error(error)
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message })
  }
}

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { role, collegeId } = req.query

    const query: any = {}

    if (role) {
      if (
        role !== UserRole.STUDENT &&
        role !== UserRole.TEACHER &&
        role !== UserRole.ADMIN
      ) {
        return res.status(400).json({ message: "Invalid user role" })
      }
      query.role = role
    }

    if (collegeId) {
      if (!mongoose.Types.ObjectId.isValid(collegeId as string)) {
        return res.status(400).json({ message: "Invalid collegeId" })
      }
      query.college = new mongoose.Types.ObjectId(collegeId as string)
    }

    const users = await User.find(query).select("_id name email")

    return res.status(200).json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const toggleSemesterStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid semester ID" })
    }

    const updated = await Semester.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: "Semester not found" })
    }

    return res.status(200).json({
      message: "Semester status updated successfully",
      semester: updated,
    })
  } catch (error: any) {
    console.error("Error updating semester:", error)
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    })
  }
}
