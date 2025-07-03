import { User } from "@/lib/types"

export const getRedirectPath = (user: User | null): string => {
  if (!user) return "/login"

  switch (user.role) {
    case "admin":
      return "/admin/dashboard"
    case "teacher":
      return "/teacher/dashboard"
    case "student":
      return "/student/dashboard"
    default:
      return "/login"
  }
}

export const getWelcomeMessage = (userName: string): string => {
  return `Login successful \nWelcome back, ${userName}!`
}

export const getRegistrationSuccessMessage = (
  isAdmin: boolean = false
): string => {
  return isAdmin
    ? "Registration successful \nAdmin and College registration successful"
    : "Registration successful \nYour account has been created"
}
