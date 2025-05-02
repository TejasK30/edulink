import nodemailer from "nodemailer"
import fs from "fs"
import { UserModel } from "../models/user"
import { IFeePayment } from "../models/FeePayment"
import { getReceiptPath } from "utils/pdfGenerator"

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export const sendReceiptEmail = async (
  student: UserModel,
  payment: IFeePayment,
  receiptFilename: string
): Promise<boolean> => {
  try {
    const receiptPath = getReceiptPath(receiptFilename)

    if (!fs.existsSync(receiptPath)) {
      throw new Error("Receipt file not found")
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || "college@example.com",
      to: student.email,
      subject: "Fee Payment Receipt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Receipt</h2>
          <p>Dear ${student.name},</p>
          <p>Thank you for your payment. Your transaction ID is: <strong>${
            payment.transactionId
          }</strong>.</p>
          <p>We have attached your receipt to this email.</p>
          <p>Payment Details:</p>
          <ul>
            ${payment.feeDetails
              .map(
                (detail) => `
              <li>${
                detail.feeType.charAt(0).toUpperCase() + detail.feeType.slice(1)
              } Fee: ₹${detail.amount.toLocaleString("en-IN")}</li>
            `
              )
              .join("")}
          </ul>
          <p>Total Amount Paid: ₹${payment.amountPaid.toLocaleString(
            "en-IN"
          )}</p>
          <p>If you have any questions, please contact the accounts department.</p>
          <p>Regards,<br>College Management System</p>
        </div>
      `,
      attachments: [
        {
          filename: `Payment_Receipt_${payment.transactionId}.pdf`,
          path: receiptPath,
          contentType: "application/pdf",
        },
      ],
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Failed to send receipt email:", error)
    return false
  }
}
