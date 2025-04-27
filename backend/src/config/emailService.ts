import nodemailer from "nodemailer"
import logger from "../utils/logger"
import { IFeeRecord } from "../models/Fee"
import { UserModel } from "../models/user"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
})

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    logger.info(`Email sent successfully to ${options.to}: ${info.messageId}`)
  } catch (error) {
    logger.error(`Error sending email to ${options.to}:`, error)
    throw new Error("Failed to send email")
  }
}

export const sendPaymentConfirmationEmail = async (
  student: UserModel,
  feeRecord: IFeeRecord
) => {
  const subject = `Payment Confirmation for ${feeRecord.feeType} Fee`
  const text = `Dear ${student.name},\n\nYour payment of INR ${
    feeRecord.amountPaid
  } for the ${feeRecord.feeType} fee (Semester ${
    feeRecord.semesterId
  }) has been successfully processed on ${feeRecord.paymentDate?.toLocaleDateString()}.\n\nTransaction ID: ${
    feeRecord.transactionId
  }\n\nThank you,\nCollege Administration`
  const html = `<p>Dear ${student.name},</p>
              <p>Your payment of <strong>INR ${
                feeRecord.amountPaid
              }</strong> for the <strong>${
    feeRecord.feeType
  }</strong> fee (Semester ${
    feeRecord.semesterId
  }) has been successfully processed on ${feeRecord.paymentDate?.toLocaleDateString()}.</p>
              <p>Transaction ID: ${feeRecord.transactionId}</p>
              <p>You can download your receipt from the student portal.</p>
              <p>Thank you,<br/>College Administration</p>`

  await sendEmail({ to: student.email, subject, text, html })
}

export const sendPaymentReminderEmail = async (
  student: UserModel,
  feeRecord: IFeeRecord
) => {
  const subject = `Fee Payment Reminder: ${feeRecord.feeType} Fee Due`
  const text = `Dear ${student.name},\n\nThis is a reminder that your ${
    feeRecord.feeType
  } fee payment of INR ${
    feeRecord.amountDue
  } is due on ${feeRecord.dueDate.toLocaleDateString()}.\n\nPlease make the payment at your earliest convenience through the student portal.\n\nThank you,\nCollege Administration`
  const html = `<p>Dear ${student.name},</p>
              <p>This is a reminder that your <strong>${
                feeRecord.feeType
              }</strong> fee payment of <strong>INR ${
    feeRecord.amountDue
  }</strong> is due on <strong>${feeRecord.dueDate.toLocaleDateString()}</strong>.</p>
              <p>Please make the payment at your earliest convenience through the student portal: <a href="${
                process.env.CLIENT_URL
              }/dashboard/fees">Pay Now</a></p>
              <p>Thank you,<br/>College Administration</p>`

  await sendEmail({ to: student.email, subject, text, html })
}
