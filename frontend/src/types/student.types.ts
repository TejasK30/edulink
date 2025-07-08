export interface StudentInfo {
  name: string
  email: string
  college: string
  department: string
}

export interface CurrentSemester {
  name: string
  year: number
}

export interface topicSchema {
  title: string
  description: string
}

export interface Course {
  _id: string
  name: string
  code: string
  credits: number
  teacherId?: {
    name: string
  } | null
  topics?: topicSchema[]
}

export interface Assignment {
  _id: string
  title: string
  dueDate: string
  questions: string[]
  courseId: {
    name: string
  }
}

export interface Grade {
  _id: string
  courseId: {
    name: string
  }
  gradeType: string
  gradeValue: number
  createdAt: string
}

export interface Attendance {
  _id: string
  courseName: string
  courseCode: string
  present: number
  absent: number
  total: number
  attendancePercentage: number
}

export interface JobPosting {
  _id: string
  companyName: string
  createdAt: string
  jobDescription: string
  role: string
  applyLink: string
}

export interface DashboardData {
  studentInfo: StudentInfo
  currentSemester: CurrentSemester
  enrolledCourses: Course[]
  upcomingAssignments: Assignment[]
  recentGrades: Grade[]
  attendanceSummary: Attendance[]
  jobPostings: JobPosting[]
}

export interface AssignmentPageCourse {
  _id: string
  name: string
  code: string
}

export interface AssignmentPageType {
  _id: string
  title: string
  name: string
  dueDate: string
  teacherId: { _id: string; name: string }
}

export interface AttendanceRecord {
  _id: string
  courseId: {
    _id: string
    name: string
    code: string
  }
  teacherId: {
    _id: string
    name: string
  }
  date: string
  status: "present" | "absent"
  createdAt: string
  updatedAt: string
}

export interface CourseInfo {
  id: string
  name: string
  code: string
}

export interface AttendanceApiResponse {
  success: boolean
  data: {
    records: AttendanceRecord[]
    stats: {
      totalClasses: number
      presentClasses: number
      absentClasses: number
      attendancePercentage: number
    }
  }
  message?: string
  error?: string
}
