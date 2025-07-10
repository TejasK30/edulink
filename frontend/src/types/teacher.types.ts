export interface TeacherInfo {
  name: string
  email: string
  college: string
  department: string
}

export interface CurrentSemester {
  name: string
  year: number
}

export interface Course {
  _id: string
  name: string
  code: string
  credits: number
  capacity?: number
}

export interface CourseEnrollment {
  courseId: string
  courseName: string
  courseCode: string
  studentCount: number
}

export interface Assignment {
  _id: string
  title: string
  dueDate: string
  courseId: {
    name: string
  }
}

export interface Grade {
  _id: string
  studentId: {
    name: string
  } | null
  courseId: {
    name: string
  }
  assignmentId: {
    title: string
  }
  score: number
}

export interface AttendanceSummary {
  _id: string
  courseName: string
  courseCode: string
  present: number
  absent: number
  total: number
  attendanceRate: number
}

export interface JobPosting {
  _id: string
  title: string
  company: string
  location: string
  type: string
  createdAt: string
}

export interface DashboardData {
  teacherInfo: TeacherInfo
  currentSemester: CurrentSemester | null
  courses: Course[]
  courseEnrollments: CourseEnrollment[]
  upcomingAssignments: Assignment[]
  recentGrades: Grade[]
  attendanceSummary: AttendanceSummary[]
  jobPostings: JobPosting[]
}
