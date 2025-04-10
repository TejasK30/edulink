import { Request, Response } from "express"
import mongoose, { Types } from "mongoose"
import Assignment, { IAssignment } from "../models/Assignment"
import Course from "../models/Course"
import Department from "../models/Department"
import User, { UserRole } from "../models/user"
import Attendance from "../models/Attendance"
import JobPosting from "../models/JobPosting"

export const getStudentDepartment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { departmentId } = req.params
    if (!departmentId || !Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid Department ID." })
    }
    const department = await Department.findById(departmentId)
    if (!department) {
      return res.status(404).json({ message: "Department not found." })
    }
    return res.status(200).json(department)
  } catch (error: any) {
    console.error("Error fetching student department:", error)
    res
      .status(500)
      .json({ message: "Failed to fetch department.", error: error.message })
  }
}

export const getCoursesByDepartmentId = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { departmentId } = req.params
    if (!departmentId || !Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid Department ID." })
    }
    const department = await Department.findById(departmentId).populate(
      "subjects"
    )
    if (!department) {
      return res.status(404).json({ message: "Department not found." })
    }
    return res.status(200).json(department.subjects)
  } catch (error: any) {
    console.error("Error fetching courses by department:", error)
    res
      .status(500)
      .json({ message: "Failed to fetch courses.", error: error.message })
  }
}

export const getStudentAssignments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const studentId = req.params.studentId
    const { subjectId } = req.query

    if (!studentId) {
      return res
        .status(400)
        .json({ message: "Student ID is required in the URL." })
    }

    const student = await User.findById(studentId)

    if (
      !student ||
      student.role !== UserRole.STUDENT ||
      !student.enrolledCourses
    ) {
      return res.status(404).json({
        message:
          "Student not found or not a student or enrolled courses missing.",
      })
    }

    const enrolledCourseIds = student.enrolledCourses.map((courseId: any) =>
      courseId.toString()
    )

    const query: any = { courseId: { $in: enrolledCourseIds } }
    if (subjectId) {
      query.courseId = subjectId
    }

    const assignments = await Assignment.find(query).sort({ dueDate: 1 })

    const groupedAssignments: { [key: string]: IAssignment[] } = {}
    assignments.forEach((assignment) => {
      if (!groupedAssignments[assignment.courseId.toString()]) {
        groupedAssignments[assignment.courseId.toString()] = []
      }
      groupedAssignments[assignment.courseId.toString()].push(assignment)
    })

    const courseDetails = await Course.find({
      _id: { $in: Object.keys(groupedAssignments) },
    })
    const courseNameMap: { [key: string]: string } = {}
    courseDetails.forEach((course: any) => {
      courseNameMap[course._id.toString()] = course.name
    })

    const result = Object.keys(groupedAssignments).map((courseId) => ({
      _id: courseId,
      name: courseNameMap[courseId] || "Unknown Course",
      assignments: groupedAssignments[courseId].filter(
        (assignment) =>
          !subjectId || assignment.courseId.toString() === subjectId
      ),
    }))

    return res.status(200).json(result)
  } catch (error: any) {
    console.error("Error fetching student assignments:", error)
    res.status(500).json({
      message: "Failed to fetch student assignments.",
      error: error.message,
    })
  }
}

export const bulkEnrollStudentInSemester = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { studentId } = req.params
    const { semesterId, collegeId } = req.body

    if (!studentId || !semesterId || !collegeId) {
      return res.status(400).json({
        message:
          "studentId (in params), semesterId, and collegeId (in body) are required",
        success: false,
      })
    }

    const courses = await Course.find({ collegeId, semesterId }).lean()
    if (!courses.length) {
      return res.status(404).json({
        message: "No courses found for the selected semester.",
        success: false,
      })
    }

    const newCoursesToEnroll = courses.filter((course) => {
      const enrolled = course.enrolledStudents || []
      return !enrolled.some((id: any) => id.toString() === studentId)
    })

    if (newCoursesToEnroll.length === 0) {
      return res.status(200).json({
        message:
          "Student is already enrolled in all courses for this semester.",
        success: true,
      })
    }

    const updatePromises = newCoursesToEnroll.map((course) =>
      Course.updateOne(
        { _id: course._id },
        { $addToSet: { enrolledStudents: studentId } }
      )
    )
    await Promise.all(updatePromises)

    await User.findByIdAndUpdate(studentId, {
      $addToSet: {
        enrolledCourses: {
          $each: newCoursesToEnroll.map((course) => course._id),
        },
      },
    })

    const updatedCourses = await Course.find({
      _id: { $in: newCoursesToEnroll.map((course) => course._id) },
    }).lean()

    return res.json({
      message: "Student bulk enrolled successfully.",
      success: true,
      courses: updatedCourses,
    })
  } catch (error: any) {
    console.error("Bulk enrollment error:", error)
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    })
  }
}

export const getEnrolledCourses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { studentId } = req.params
    if (!studentId) {
      return res
        .status(400)
        .json({ message: "Student ID is required", success: false })
    }

    const courses = await Course.find({ enrolledStudents: studentId })
      .select("_id name code credits")
      .lean()

    return res.status(200).json({ courses, success: true })
  } catch (error: any) {
    console.error("Error fetching enrolled courses:", error)
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    })
  }
}

export const getStudentAttendance = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { studentId } = req.params
    const { courseId, startDate, endDate } = req.query

    const filter: any = {
      studentId: new mongoose.Types.ObjectId(studentId),
    }

    if (courseId) {
      filter.courseId = new mongoose.Types.ObjectId(courseId as string)
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      }
    }

    const attendanceRecords = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate("courseId", "name code")
      .populate("teacherId", "name")
      .lean()

    const totalClasses = attendanceRecords.length
    const presentClasses = attendanceRecords.filter(
      (record) => record.status === "present"
    ).length
    const attendancePercentage =
      totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0

    return res.status(200).json({
      success: true,
      data: {
        records: attendanceRecords,
        stats: {
          totalClasses,
          presentClasses,
          absentClasses: totalClasses - presentClasses,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100,
        },
      },
    })
  } catch (error: any) {
    console.error("Error fetching attendance:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

export const getJobsByCollegeStudent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId } = req.params
    console.log(collegeId)
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
