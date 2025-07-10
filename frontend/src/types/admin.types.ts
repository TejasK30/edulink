export type Job = {
  _id: string
  companyName: string
  applyLink: string
  jobDescription: string
  createdAt: string
}

export type Department = {
  departmentId: string
  name: string
  studentCount: number
  teacherCount: number
  courseCount: number
}

export type Semester = {
  _id: string
  name: string
  year: number
  startDate: string
  endDate: string
  subjects: string[]
}

export type AdminData = {
  college: {
    name: string
    address: string
  }
  name: string
  email: string
}
