import { Request, Response } from "express"
import Course from "../models/Course"
import Attendance from "../models/Attendance"
import { Types } from "mongoose"
import User from "../models/user"

export const getTeacherCourses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { teacherId } = req.params

    console.log(teacherId)

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

export const getStudentsByCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const courseId = req.params.courseId
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" })
    }

    const course = await Course.findById(courseId).populate(
      "enrolledStudents",
      "name email"
    )
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.status(200).json(course.enrolledStudents)
  } catch (error: any) {
    console.error("Error fetching students by course:", error)
    res
      .status(500)
      .json({ message: "Failed to fetch students", error: error.message })
  }
}

interface AttendanceRecordDTO {
  studentId: string
  status: "present" | "absent"
}
export const markAttendance = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const teacherId = req.params.teacherId
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { collegeId, departmentId, courseId, date, attendanceRecords } =
      req.body

    if (
      !collegeId ||
      !departmentId ||
      !courseId ||
      !date ||
      !Array.isArray(attendanceRecords)
    ) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const attendanceDate = new Date(date)
    const bulkOps = attendanceRecords.map((record: AttendanceRecordDTO) => ({
      updateOne: {
        filter: {
          collegeId: new Types.ObjectId(collegeId),
          departmentId: new Types.ObjectId(departmentId),
          courseId: new Types.ObjectId(courseId),
          studentId: new Types.ObjectId(record.studentId),
          teacherId: new Types.ObjectId(teacherId),
          date: attendanceDate,
        },
        update: {
          $set: {
            status: record.status,
            updatedAt: new Date(),
          },
        },
        upsert: true,
      },
    }))

    const result = await Attendance.bulkWrite(bulkOps)

    const course = await Course.findById(courseId).select("name")
    if (!course) {
      throw new Error("Course not found")
    }

    const studentIds = attendanceRecords.map((record) => record.studentId)
    const students = await User.find({
      _id: { $in: studentIds.map((id) => new Types.ObjectId(id)) },
    }).select("email name")

    const formattedDate = attendanceDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const presentStudents: string[] = []
    const absentStudents: string[] = []

    attendanceRecords.forEach((record: AttendanceRecordDTO) => {
      const student = students.find((s) => {
        s._id === record.studentId
      })
      if (student && student.email) {
        if (record.status === "present") {
          presentStudents.push(student.email)
        } else {
          absentStudents.push(student.email)
        }
      }
    })

    return res.status(200).json({
      message: "Attendance marked successfully and notifications sent",
      result,
    })
  } catch (error: any) {
    console.error("Error marking attendance:", error)
    return res
      .status(500)
      .json({ message: "Failed to mark attendance", error: error.message })
  }
}
