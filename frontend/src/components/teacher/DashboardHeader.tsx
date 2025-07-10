import { CurrentSemester, TeacherInfo } from "@/types/teacher.types"

interface DashboardHeaderProps {
  teacherInfo: TeacherInfo
  currentSemester: CurrentSemester | null
}

export const DashboardHeader = ({
  teacherInfo,
  currentSemester,
}: DashboardHeaderProps) => {
  return (
    <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white">
      <h1 className="text-2xl font-bold">
        Welcome back, Professor{" "}
        {teacherInfo.name.split(" ")[1] || teacherInfo.name}!
      </h1>
      <p className="mt-1">
        Current Semester: {currentSemester?.name} {currentSemester?.year}
      </p>
    </div>
  )
}
