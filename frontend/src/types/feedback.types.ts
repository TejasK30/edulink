export interface Teacher {
  _id: string
  name: string
}

export interface TeacherFeedback {
  clarity: number
  expertise: number
  engagement: number
  punctuality: number
  assessment: number
  subjectContent: number
  overallTeacher: number
  teacherComment?: string
}

export interface CollegeFeedback {
  facilities: number
  campusLife: number
  administration: number
  academicEnvironment: number
  overallCollege: number
  collegeComment?: string
}

export interface FeedbackFormValues {
  teacherFeedback: Partial<TeacherFeedback>
  collegeFeedback: Partial<CollegeFeedback>
}

export interface FeedbackPayload {
  teacherId: string | null
  teacherFeedback: Partial<TeacherFeedback>
  collegeFeedback: Partial<CollegeFeedback>
}

export interface FeedbackResponse {
  message: string
  success: boolean
}

export interface ApiError {
  response?: {
    data?: {
      details?: string
      error?: string
    }
  }
  request?: unknown
  message?: string
}

export interface User {
  _id: string
  collegeid: string
  name?: string
  email?: string
}
