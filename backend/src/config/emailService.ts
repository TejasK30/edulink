import nodemailer from "nodemailer"
import { emailConfig } from "../email/config/emailConfig"
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass,
  },
})

transporter.verify((error) => {
  if (error) {
    console.error("Error connecting to email server:", error)
  } else {
    console.log("Email server connection established successfully")
  }
})

export default transporter
