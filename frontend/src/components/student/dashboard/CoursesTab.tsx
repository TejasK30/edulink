import { Course } from "@/types/student.types"
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

export const CoursesTab = ({ courses }: { courses: Course[] }) => (
  <TabsContent value="courses" className="space-y-4">
    <h2 className="text-xl font-semibold">My Courses</h2>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course: Course) => (
        <Card key={course._id}>
          <CardHeader>
            <CardTitle>{course.name}</CardTitle>
            <CardDescription>
              <span className="font-mono">{course.code}</span> •{" "}
              {course.credits} Credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Instructor:</span>
                <span className="font-medium">
                  {course.teacherId?.name || "TBA"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <Badge>Active</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Topics: {course.topics?.length || 0}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  </TabsContent>
)
