import { SemesterForm } from "@/components/admin/semester-ui/SemesterForm"
import { SemesterTable } from "@/components/admin/semester-ui/SemesterTable"

export default function SemestersPage() {
  return (
    <div className="container mx-auto py-8 px-4 grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold mb-4">Create Semester</h1>
        <SemesterForm />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-4">Semesters</h1>
        <SemesterTable />
      </div>
    </div>
  )
}
