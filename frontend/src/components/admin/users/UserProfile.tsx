import { DetailedUser } from "@/lib/schemas/user.schema"
import React from "react"

interface UserProfileProps {
  user: DetailedUser
  role: string
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, role }) => {
  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-2">
        <h4 className="text-base font-semibold">Basic Information</h4>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong>{" "}
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </p>
        {user.department && (
          <p>
            <strong>Department:</strong> {user.department.name}
          </p>
        )}
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(user.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Updated At:</strong>{" "}
          {new Date(user.updatedAt).toLocaleString()}
        </p>
        <p>
          <strong>ID:</strong> {user._id}
        </p>
      </section>

      {role === "student" && (
        <section className="space-y-4">
          <h4 className="text-base font-semibold">Academic Information</h4>

          <div className="space-y-2">
            <h5 className="text-sm font-medium">Enrolled Courses</h5>
            {user.enrolledCourses?.length ? (
              <ul className="list-disc list-inside ml-4">
                {user.enrolledCourses.map((course) => (
                  <li key={course._id}>
                    {course.code} - {course.name} ({course.credits} credits)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-xs">
                Not enrolled in any courses.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-medium">Attendance</h5>
            {user.attendance?.length ? (
              <ul className="list-disc list-inside ml-4">
                {user.attendance.map((att) => (
                  <li key={att._id}>
                    {att.courseId.code} - {att.courseId.name}:{" "}
                    {new Date(att.date).toLocaleDateString()} - {att.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-xs">
                No attendance records.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-medium">Grades</h5>
            {user.grades?.length ? (
              <ul className="list-disc list-inside ml-4">
                {user.grades.map((grade) => (
                  <li key={grade._id}>
                    {grade.courseId.code} - {grade.courseId.name}:{" "}
                    {grade.gradeType} - {grade.gradeValue}
                    (Last updated:{" "}
                    {new Date(grade.updatedAt).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-xs">No grade records.</p>
            )}
          </div>
        </section>
      )}

      {role === "teacher" && (
        <section className="space-y-4">
          <h4 className="text-base font-semibold">Teaching Information</h4>

          <div className="space-y-2">
            <h5 className="text-sm font-medium">Teaching Courses</h5>
            {user.teachingCourses?.length ? (
              <ul className="list-disc list-inside ml-4">
                {user.teachingCourses.map((course) => (
                  <li key={course._id}>
                    {course.code} - {course.name} ({course.credits} credits) -{" "}
                    {course.enrolledStudents} enrolled students
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-xs">
                Not assigned to teach any courses.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-medium">Feedbacks</h5>
            {user.feedbacks?.length ? (
              <ul className="list-disc list-inside ml-4">
                {user.feedbacks.map((feedback) => (
                  <li key={feedback._id}>
                    Rating: {feedback.rating}/5 - "{feedback.message}" (on{" "}
                    {new Date(feedback.createdAt).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-xs">
                No feedback received yet.
              </p>
            )}
          </div>
        </section>
      )}

      {role === "admin" && (
        <div className="space-y-2">
          <h5 className="text-base font-semibold">Additional Information</h5>
          <p className="text-muted-foreground text-sm">
            No additional role-specific information available.
          </p>
        </div>
      )}
    </div>
  )
}
