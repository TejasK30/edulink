import { Request, Response } from "express"
import User, { UserRole } from "../models/user"
import College from "../models/College"
import Department from "../models/Department"
import Course from "../models/Course"
import Grade from "../models/Grade"
import Attendance from "../models/Attendance"
import Assignment from "../models/Assignment"
import JobPosting from "../models/JobPosting"
import Semester from "../models/Semester"
import mongoose from "mongoose"

const validateUser = async (
  userId: string,
  role: UserRole
): Promise<boolean> => {
  try {
    const user = await User.findById(userId)
    return user?.role === role
  } catch (error) {
    return false
  }
}

export const getStudentDashboard = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params

    if (!(await validateUser(userId, UserRole.STUDENT))) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const student = await User.findById(userId)
      .populate("college", "collegeName")
      .populate("department", "name")
      .populate("enrolledCourses", "name code credits teacherId")

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    const currentSemester = await Semester.findOne({
      collegeId: student.college,
      isActive: true,
    })

    if (!currentSemester) {
      return res.status(404).json({ message: "No active semester found" })
    }

    const courses = student.enrolledCourses || []
    const courseIds = courses.map((course: any) => course._id)

    const upcomingAssignments = await Assignment.find({
      courseId: { $in: courseIds },
      dueDate: { $gte: new Date() },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate("courseId", "name")

    const recentGrades = await Grade.find({
      studentId: userId,
      courseId: { $in: courseIds },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("courseId", "name")

    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(userId),
          courseId: {
            $in: courseIds.map(
              (id: any) => new mongoose.Types.ObjectId(id.toString())
            ),
          },
        },
      },
      {
        $group: {
          _id: "$courseId",
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $project: {
          courseName: "$course.name",
          courseCode: "$course.code",
          present: 1,
          absent: 1,
          total: 1,
          attendancePercentage: {
            $multiply: [{ $divide: ["$present", "$total"] }, 100],
          },
        },
      },
    ])

    const jobPostings = await JobPosting.find({
      collegeId: student.college,
    })
      .sort({ createdAt: -1 })
      .limit(5)

    return res.status(200).json({
      studentInfo: {
        name: student.name,
        email: student.email,
        college: student.college,
        department: student.department,
      },
      currentSemester: {
        name: currentSemester.name,
        year: currentSemester.year,
      },
      enrolledCourses: courses,
      upcomingAssignments,
      recentGrades,
      attendanceSummary,
      jobPostings,
    })
  } catch (error) {
    console.error("Error in student dashboard:", error)
    return res.status(500).json({ message: "Server error" })
  }
}

export const getTeacherDashboard = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params

    if (!(await validateUser(userId, UserRole.TEACHER))) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const teacher = await User.findById(userId)
      .populate("college", "collegeName")
      .populate("department", "name")

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    const currentSemester = await Semester.findOne({
      collegeId: teacher.college,
      isActive: true,
    })

    if (!currentSemester) {
      return res.status(404).json({ message: "No active semester found" })
    }

    const courses = await Course.find({
      teacherId: userId,
      semesterId: currentSemester._id,
    }).populate("enrolledStudents")

    const courseEnrollments = courses.map((course: any) => ({
      courseId: course._id,
      courseName: course.name,
      courseCode: course.code,
      studentCount: course.enrolledStudents
        ? course.enrolledStudents.length
        : 0,
    }))

    const upcomingAssignments = await Assignment.find({
      teacherId: userId,
      dueDate: { $gte: new Date() },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate("courseId", "name")

    const recentGrades = await Grade.find({
      courseId: { $in: courses.map((course: any) => course._id) },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("courseId", "name")
      .populate("studentId", "name")

    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          teacherId: new mongoose.Types.ObjectId(userId),
          courseId: {
            $in: courses.map(
              (course: any) =>
                new mongoose.Types.ObjectId(course._id.toString())
            ),
          },
        },
      },
      {
        $group: {
          _id: "$courseId",
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $project: {
          courseName: "$course.name",
          courseCode: "$course.code",
          present: 1,
          absent: 1,
          total: 1,
          attendanceRate: {
            $multiply: [
              { $divide: ["$present", { $max: ["$total", 1] }] },
              100,
            ],
          },
        },
      },
    ])

    const jobPostings = await JobPosting.find({
      postedBy: userId,
      role: "teacher",
    })
      .sort({ createdAt: -1 })
      .limit(5)

    return res.status(200).json({
      teacherInfo: {
        name: teacher.name,
        email: teacher.email,
        college: teacher.college,
        department: teacher.department,
      },
      currentSemester: currentSemester
        ? {
            name: currentSemester.name,
            year: currentSemester.year,
          }
        : null,
      courses,
      courseEnrollments,
      upcomingAssignments,
      recentGrades,
      attendanceSummary,
      jobPostings,
    })
  } catch (error) {
    console.error("Error in teacher dashboard:", error)
    return res.status(500).json({ message: "Server error" })
  }
}

export const getAdminDashboard = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params

    if (!(await validateUser(userId, UserRole.ADMIN))) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const admin = await User.findById(userId).populate("college", "collegeName")

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    const collegeId = admin.college

    const college = await College.findById(collegeId)

    if (!college) {
      return res.status(404).json({ message: "College not found" })
    }

    const departments = await Department.find({ collegeId })

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const studentCount = await User.countDocuments({
          department: dept._id,
          role: UserRole.STUDENT,
        })

        const teacherCount = await User.countDocuments({
          department: dept._id,
          role: UserRole.TEACHER,
        })

        const courseCount = await Course.countDocuments({
          departmentId: dept._id,
        })

        return {
          departmentId: dept._id,
          name: dept.name,
          studentCount,
          teacherCount,
          courseCount,
        }
      })
    )

    const activeSemesters = await Semester.find({
      collegeId,
      isActive: true,
    })

    const userCounts = {
      students: await User.countDocuments({
        college: collegeId,
        role: UserRole.STUDENT,
      }),
      teachers: await User.countDocuments({
        college: collegeId,
        role: UserRole.TEACHER,
      }),
      admins: await User.countDocuments({
        college: collegeId,
        role: UserRole.ADMIN,
      }),
    }

    const recentJobPostings = await JobPosting.find({
      collegeId,
    })
      .sort({ createdAt: -1 })
      .limit(5)

    return res.status(200).json({
      adminInfo: {
        name: admin.name,
        email: admin.email,
        college: {
          id: college._id,
          name: college.collegeName,
          address: college.collegeAddress,
        },
      },
      departmentStats,
      activeSemesters,
      userCounts,
      recentJobPostings,
    })
  } catch (error) {
    console.error("Error in admin dashboard:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
