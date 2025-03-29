import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "./api"

export type UserRoleType = "student" | "teacher" | "admin"

export type User =
  | {
      _id: string
      name: string
      email: string
      role: "student"
      collegname: string
      collegeid: string
      department?: string
    }
  | {
      _id: string
      name: string
      email: string
      role: "teacher" | "admin"
      collegeid: string
      collegname: string
      departments: string[]
      admins: string[]
      teachers: string[]
      students: string[]
    }
  | null

type College = {
  id: string
  name: string
  address: string
  logo?: string
}

type AppState = {
  colleges: College[]
  selectedCollege: College | null
  addCollege: (college: College) => void
  updateCollege: (id: string, college: Partial<College>) => void
  deleteCollege: (id: string) => void
  setSelectedCollege: (college: College | null) => void
  fetchColleges: () => Promise<void>
  currentUser: User
  setUser: (user: User) => void
  clearUser: () => void
  students: (User & { role: "student" })[]
  teachers: (User & { role: "teacher" })[]
  admins: (User & { role: "admin" })[]
  fetchStudents: (collegeId: string) => Promise<void>
  fetchTeachers: (collegeId: string) => Promise<void>
  fetchAdmins: (collegeId: string) => Promise<void>
  login: (credentials: { email: string; password: string }) => Promise<boolean>
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      colleges: [],
      selectedCollege: null,
      addCollege: (college) =>
        set((state) => ({ colleges: [...state.colleges, college] })),
      updateCollege: (id, updatedCollege) =>
        set((state) => ({
          colleges: state.colleges.map((college) =>
            college.id === id ? { ...college, ...updatedCollege } : college
          ),
        })),
      deleteCollege: (id) =>
        set((state) => ({
          colleges: state.colleges.filter((college) => college.id !== id),
        })),
      setSelectedCollege: (college) => set({ selectedCollege: college }),
      fetchColleges: async () => {
        try {
          const response = await api.get("/auth/colleges")
          const data: {
            _id: string
            collegeName: string
            collegeAddress: string
            logo?: string
          }[] = response.data

          const formattedColleges: College[] = data.map((college) => ({
            id: college._id,
            name: college.collegeName,
            address: college.collegeAddress,
            logo: college.logo,
          }))

          set({ colleges: formattedColleges })
        } catch (error) {
          console.error("Error fetching colleges:", error)
        }
      },
      currentUser: null,
      setUser: (user) => set({ currentUser: user }),
      clearUser: () => set({ currentUser: null }),
      students: [],
      teachers: [],
      admins: [],
      fetchStudents: async (collegeId) => {
        try {
          const response = await api.get(`/admin/users/students/${collegeId}`)
          set({ students: response.data })
        } catch (error) {
          console.error("Error fetching students:", error)
          set({ students: [] })
        }
      },
      fetchTeachers: async (collegeId) => {
        try {
          const response = await api.get(`/admin/users/teachers/${collegeId}`)
          set({ teachers: response.data })
        } catch (error) {
          console.error("Error fetching teachers:", error)
          set({ teachers: [] })
        }
      },
      fetchAdmins: async (collegeId) => {
        try {
          const response = await api.get(`/admin/users/admins/${collegeId}`)
          set({ admins: response.data })
        } catch (error) {
          console.error("Error fetching admins:", error)
          set({ admins: [] })
        }
      },
      login: async (credentials) => {
        try {
          const response = await api.post("/auth/login", credentials)
          if (response.data.message === "Login successful") {
            set({ currentUser: response.data.user })
            return true
          } else {
            console.error("Login failed:", response.data.message)
            return false
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Login error:", error.message)
          } else {
            console.error("Login error:", error)
          }
          return false
        }
      },
    }),
    {
      name: "college-connect-storage",
    }
  )
)
