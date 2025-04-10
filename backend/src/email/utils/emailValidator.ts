export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase()
}

export const isBlockedDomain = (
  email: string,
  blockedDomains: string[] = []
): boolean => {
  const domain = email.split("@")[1].toLowerCase()
  return blockedDomains.includes(domain)
}

export const validateEmailBatch = (
  emails: string[]
): { valid: string[]; invalid: string[] } => {
  const valid: string[] = []
  const invalid: string[] = []

  for (const email of emails) {
    if (isValidEmail(email)) {
      valid.push(normalizeEmail(email))
    } else {
      invalid.push(email)
    }
  }

  return { valid, invalid }
}
