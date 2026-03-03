import { Queue, Worker } from "bullmq"
import { redis } from "./redis"
import { transporter } from "./emailConfig"
import { User } from "../utils/types"
import { parseTemplate } from "../utils/templateParser"
import { subjects, templates } from "../email/templates"
import { UserModel } from "../models/user"
import { welcomeTemplate } from "../email/templates/welcome"

export const emailQueue = new Queue("email-queue", { connection: redis })

export interface EmailJobData {
  template: string
  user: Partial<UserModel>
  data?: Record<string, string>
}

export const addEmailJob = async (data: EmailJobData) => {
  await emailQueue.add(`email-${data.template}`, data, {
    attempts: 3,
    removeOnFail: false,
    removeOnComplete: true,
  })
}

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { user, template, data } = job.data

    const variables = {
      year: new Date().getFullYear(),
      ...data,
    }

    const templateHtml = templates[template]

    const html = parseTemplate(templateHtml, variables)

    await transporter.sendMail({
      from: `"EduLink" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: subjects[template] || "EduLink Notification",
      html,
    })
  },
  {
    connection: redis,
  },
)

emailWorker.on("active", () => {
  console.log(`email worker active`)
})

emailWorker.on("completed", (job) => {
  console.log("Job completed:", job.id)
})

emailWorker.on("failed", (job, err) => {
  console.log("Job failed:", job?.id, err)
})
