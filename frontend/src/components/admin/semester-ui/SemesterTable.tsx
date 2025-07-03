"use client"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { useSemesters, useToggleSemester } from "@/hooks/useSemester"
import { useAuth } from "@/lib/auth-provider"

export function SemesterTable() {
  const { user } = useAuth()
  const { data: semesters = [] } = useSemesters(user?.collegeId)
  const toggle = useToggleSemester()

  return semesters.length === 0 ? (
    <p className="text-center text-muted-foreground py-4">
      No semesters found.
    </p>
  ) : (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {semesters.map((sem) => (
          <TableRow key={sem._id}>
            <TableCell>{sem.name}</TableCell>
            <TableCell>{sem.year}</TableCell>
            <TableCell>
              {format(new Date(sem.startDate), "MMM d")} -{" "}
              {format(new Date(sem.endDate), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              <Switch
                checked={sem.isActive}
                onCheckedChange={() =>
                  toggle.mutate({ id: sem._id, current: sem.isActive })
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
