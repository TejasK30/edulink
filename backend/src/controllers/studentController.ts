import { Request, Response } from "express"
import Enrollment from "models/Enrollment"
import Grade from "models/Grade"
import Announcement from "../models/Announcement"
import Assignment from "../models/Assignment"
import Attendance from "../models/Attendance"

export const studentDashboardData = async (req: Request, res: Response) => {
  try {
    const studentId = req.student?._id
    const collegeId = req.student?.collegeId
    const departmentId = req.student?.department // Assuming department is a string

    // --- Feature 1: Fetch Enrolled Courses (Accurate) ---
    const enrollments = await Enrollment.find({
      studentId,
      collegeId,
    }).populate("courseId", "name code") // Populate course details (name, code)
    const enrolledCourses = enrollments.map((enrollment) => enrollment.courseId)

    // --- Feature 2: Fetch Upcoming Assignments (Based on Enrolled Courses) ---
    const courseIds = enrolledCourses.map((course) => course._id)
    const upcomingAssignments = await Assignment.find({
      courseId: { $in: courseIds }, // Filter assignments for enrolled courses
      dueDate: { $gte: new Date() }, // Only show assignments with due dates in the future
    })
      .sort({ dueDate: 1 })
      .limit(5) // Show the next 5 upcoming assignments

    // --- Feature 3: Fetch Recent Announcements (College and Department Specific) ---
    const recentAnnouncements = await Announcement.find({
      collegeId,
      $or: [
        { departmentId: departmentId },
        { departmentId: { $exists: false } }, // Announcements without a specific department are for everyone
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5) // Show the 5 most recent announcements

    const recentGrades = await Grade.find({
      studentId,
      courseId: { $in: courseIds },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("courseId", "name code") // Populate course details for the grades

    // --- Feature 5: Fetch Attendance Summary (for Current Month - Example) ---
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          studentId: studentId,
          collegeId: collegeId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$courseId",
          presentCount: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          totalLectures: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses", // The name of your Course collection
          localField: "_id",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      {
        $unwind: "$courseInfo", // Deconstruct the courseInfo array
      },
      {
        $project: {
          _id: 0,
          courseName: "$courseInfo.name",
          courseCode: "$courseInfo.code",
          presentCount: 1,
          absentCount: 1,
          totalLectures: 1,
        },
      },
    ])

    // --- Feature 6: Fetch Upcoming Events (Assuming an 'Event' model exists) ---
    // const upcomingEvents = await Event.find({
    //   collegeId,
    //   date: { $gte: new Date() },
    // })
    //   .sort({ date: 1 })
    //   .limit(3);

    // --- Feature 7: Fetch Recent Notifications (Assuming a 'Notification' model exists) ---
    // const recentNotifications = await Notification.find({
    //   studentId, // Or a more general scope like collegeId or departmentId
    // })
    //   .sort({ createdAt: -1 })
    //   .limit(5);

    res.status(200).json({
      enrolledCourses: enrolledCourses, // Now accurately reflects enrolled courses
      upcomingAssignments,
      recentAnnouncements,
      recentGrades,
      attendanceSummary,
      // upcomingEvents, // Uncomment if you have an Event model
      // recentNotifications, // Uncomment if you have a Notification model
    })
  } catch (error: any) {
    console.error(error)
    res
      .status(500)
      .json({ message: "Server error fetching student dashboard data" })
  }
}

export const getAttendace = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const studentId = req.student?._id
    const collegeId = req.student?.collegeId

    if (!studentId || !collegeId) {
      return res
        .status(401)
        .json({ message: "Unauthorized or College ID not found." })
    }

    const attendance = await Attendance.find({ studentId, collegeId }).sort({
      date: -1,
    })
    res.status(200).json(attendance)
  } catch (error: any) {
    console.error("Error fetching student attendance:", error)
    res.status(500).json({ message: "Server error while fetching attendance." })
  }
}
