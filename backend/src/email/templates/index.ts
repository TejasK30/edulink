import { welcomeTemplate } from "./welcome"

// stores email template name and its template
export const templates: Record<string, string> = {
  welcome: welcomeTemplate,
}

// stores subjects for email template
export const subjects: Record<string, string> = {
  welcome: "Welcome to EduLink",
}
