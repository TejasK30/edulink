import { Request, Response } from "express"
import Assignment from "../models/Assignment"
import Course from "models/Course"
import Announcement from "models/Announcement"
import Teacher from "models/Teacher"
import Attendance from "models/Attendance"

export const getTeacherDashboardData = async (req: Request, res: Response) => {
  try {
    const teacherId = req.teacher?._id
    const collegeId = req.teacher?.collegeId

    const coursesTeaching = await Course.find({ collegeId, teacherId }).limit(5)

    const upcomingAssignmentsToGrade = await Assignment.find({
      teacherId,
      dueDate: { $gte: new Date() },
    })
      .sort({ dueDate: 1 })
      .limit(3)

    const recentAnnouncements = await Announcement.find({ collegeId })
      .sort({ createdAt: -1 })
      .limit(5)

    res.status(200).json({
      coursesTeaching,
      upcomingAssignmentsToGrade,
      recentAnnouncements,
    })
  } catch (error: any) {
    console.error(error)
    res
      .status(500)
      .json({ message: "Server error fetching teacher dashboard data" })
  }
}

export const createAssignment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const teacherId = req.teacher?._id
    const collegeId = req.teacher?.collegeId
    const {
      courseId,
      title,
      description,
      dueDate,
      totalMarks,
      submissionType,
    } = req.body

    const course = await Course.findById(courseId)
    if (
      !course ||
      course.collegeId.toString() !== collegeId?.toString() ||
      course.teacherId?.toString() !== (teacherId as string).toString()
    ) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized." })
    }

    const assignment = new Assignment({
      courseId,
      title,
      description,
      dueDate: new Date(dueDate),
      totalMarks,
      submissionType,
    })
    await assignment.save()
    res.status(201).json({
      message: "Assignment created successfully.",
      assignmentId: assignment._id,
    })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: "Server error creating assignment." })
  }
}

export const getAllAssignemnts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const teacherId = req.teacher?._id
    const collegeId = req.teacher?.collegeId
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (
      !course ||
      course.collegeId.toString() !== collegeId?.toString() ||
      course.teacherId?.toString() !== teacherId?.toString()
    ) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized." })
    }

    const assignments = await Assignment.find({ courseId }).sort({ dueDate: 1 })
    res.status(200).json(assignments)
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: "Server error fetching assignments." })
  }
}

export const getTeacherDepartments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const teacherId = req.teacher?._id
    const collegeId = req.teacher?.collegeId
    if (!teacherId || !collegeId) {
      return res
        .status(401)
        .json({ message: "Unauthorized or College ID not found." })
    }

    const teacher = await Teacher.findById(teacherId).populate("departments")
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." })
    }

    return res.status(200).json(teacher.departments)
  } catch (error: any) {
    console.error("Error fetching teacher departments:", error)
    res
      .status(500)
      .json({ message: "Server error while fetching departments." })
  }
}

export const getTeacherCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const teacherId = req.teacher?._id
    const collegeId = req.teacher?.collegeId
    const { departmentId } = req.params

    if (!teacherId || !collegeId || !departmentId) {
      return res
        .status(401)
        .json({ message: "Unauthorized or missing required IDs." })
    }

    const courses = await Course.find({
      teacher: teacherId,
      departmentId,
      collegeId,
    })
    res.status(200).json(courses)
  } catch (error: any) {
    console.error("Error fetching teacher courses:", error)
    res.status(500).json({ message: "Server error while fetching courses." })
  }
}

export const markAttendance = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { departmentId, courseId, date, attendanceRecords } = req.body
    const teacherId = req.teacher?._id
    const collegeId = req.teacher?.collegeId

    if (
      !teacherId ||
      !collegeId ||
      !departmentId ||
      !courseId ||
      !date ||
      !Array.isArray(attendanceRecords)
    ) {
      return res.status(400).json({ message: "Missing required fields." })
    }

    const attendanceDate = new Date(date)

    const bulkOps = attendanceRecords.map(
      (record: { studentId: string; status: "present" | "absent" }) => ({
        updateOne: {
          filter: {
            collegeId,
            departmentId,
            courseId,
            studentId: record.studentId,
            date: attendanceDate,
          },
          update: {
            $set: {
              teacherId,
              status: record.status,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      })
    )

    const result = await Attendance.bulkWrite(bulkOps)
    res.status(200).json({ message: "Attendance marked successfully.", result })
  } catch (error: any) {
    console.error("Error marking attendance:", error)
    res.status(500).json({ message: "Server error while marking attendance." })
  }
}
