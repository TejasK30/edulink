export const generateAttendanceEmailTemplate = (
  studentName: string,
  courseName: string,
  formattedDate: string,
  status: "present" | "absent"
): string => {
  const statusText = status === "present" ? "Present" : "Absent"
  const statusColor = status === "present" ? "green" : "red"

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Attendance Notification</h2>
      <p>Hello ${studentName},</p>
      <p>This is to notify you about your attendance for:</p>
      <ul>
        <li><strong>Course:</strong> ${courseName}</li>
        <li><strong>Date:</strong> ${formattedDate}</li>
        <li><strong>Status:</strong> <span style="font-weight: bold; color: ${statusColor}">${statusText}</span></li>
      </ul>
      <p>Please note that maintaining at least 75% attendance is required for this course.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  `
}
