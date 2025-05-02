import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"
import { UserModel } from "../models/user"
import { IFeePayment } from "../models/FeePayment"
import { getReceiptPath } from "./pdfGenerator"

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export const sendFeeReceipt = async (
  user: UserModel,
  payment: IFeePayment,
  receiptFilename: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    const receiptPath = getReceiptPath(receiptFilename)

    const info = await transporter.sendMail({
      from: `"EduLink University" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Fee Payment Receipt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #444; text-align: center;">Fee Payment Receipt</h2>
          <p>Dear ${user.name},</p>
          <p>Thank you for your fee payment. Your transaction has been processed successfully.</p>
          <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
          <p><strong>Amount Paid:</strong> ₹${payment.amountPaid.toLocaleString()}</p>
          <p><strong>Date:</strong> ${payment.paymentDate.toLocaleDateString()}</p>
          <p>Please find your receipt attached to this email.</p>
          <p>If you have any questions regarding your payment, please contact the accounts department.</p>
          <p>Best regards,<br>EduLink University</p>
        </div>
      `,
      attachments: [
        {
          filename: "fee_receipt.pdf",
          path: receiptPath,
          contentType: "application/pdf",
        },
      ],
    })

    return !!info.messageId
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
