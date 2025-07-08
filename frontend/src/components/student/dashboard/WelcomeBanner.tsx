export const WelcomeBanner = ({
  studentName,
  currentSemester,
}: {
  studentName: string
  currentSemester: { name: string; year: number }
}) => (
  <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
    <h1 className="text-2xl font-bold">Welcome back, {studentName}!</h1>
    <p className="mt-1">
      Current Semester: {currentSemester.name} {currentSemester.year}
    </p>
  </div>
)
