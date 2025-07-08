import { Assignment } from "@/types/student.types"
import { TabsContent } from "../../ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { Badge } from "../../ui/badge"
import Link from "next/link"
import { EmptyState } from "./EmptyState"
import { CheckCircleIcon } from "lucide-react"

export const AssignmentsTab = ({
  assignments,
}: {
  assignments: Assignment[]
}) => (
  <TabsContent value="assignments" className="space-y-4">
    <h2 className="text-xl font-semibold">Upcoming Assignments</h2>
    {assignments.length > 0 ? (
      <div className="grid gap-4">
        {assignments.map((assignment: Assignment) => (
          <Card key={assignment._id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription>{assignment.courseId.name}</CardDescription>
                </div>
                <Badge
                  variant={
                    new Date(assignment.dueDate) <=
                    new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)
                      ? "destructive"
                      : "outline"
                  }
                >
                  Due {new Date(assignment.dueDate).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{assignment.questions.length} questions</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-xs text-muted-foreground">
                {new Date(assignment.dueDate).toLocaleDateString()} at{" "}
                {new Date(assignment.dueDate).toLocaleTimeString()}
              </div>
              <Link href={`/student/assignments/${assignment._id}`}>
                <Badge
                  variant="secondary"
                  className="bg-primary/70 hover:bg-primary"
                >
                  View Details
                </Badge>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={CheckCircleIcon}
        title="All Caught Up!"
        description="You don't have any upcoming assignments due."
      />
    )}
  </TabsContent>
)
