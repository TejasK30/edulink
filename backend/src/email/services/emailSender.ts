import nodemailer from "nodemailer"
import transporter from "../../config/emailService"
import { emailConfig } from "../config/emailConfig"

interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  attachments?: EmailAttachment[]
  cc?: string | string[]
  bcc?: string | string[]
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions: nodemailer.SendMailOptions = {
      from: emailConfig.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [],
    }

    if (options.cc) {
      mailOptions.cc = options.cc
    }

    if (options.bcc) {
      mailOptions.bcc = options.bcc
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.messageId)
    return true
  } catch (error) {
    console.error("Failed to send email:", error)
    return false
  }
}

export const sendBulkEmails = async (
  recipients: string[],
  subject: string,
  html: string,
  batchSize = 50
): Promise<{ success: number; failed: number }> => {
  let success = 0
  let failed = 0

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)
    const batchPromises = batch.map((recipient) =>
      sendEmail({
        to: recipient,
        subject,
        html,
      }).then((result) => {
        if (result) success++
        else failed++
        return result
      })
    )

    await Promise.all(batchPromises)
  }

  return { success, failed }
}
