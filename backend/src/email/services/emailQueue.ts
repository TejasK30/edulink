import { Queue, JobScheduler, Worker } from "bullmq"
import { sendEmail } from "./emailSender"
import Redis from "ioredis"

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

interface EmailJob {
  to: string | string[]
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
  cc?: string | string[]
  bcc?: string | string[]
  priority?: number
}

const emailQueue = new Queue<EmailJob>("email-queue", { connection })
new JobScheduler("email-queue", { connection })

const worker = new Worker<EmailJob>(
  "email-queue",
  async (job) => {
    try {
      const result = await sendEmail(job.data)
      return result
    } catch (error) {
      console.error(`Failed to process email job ${job.id}:`, error)
      throw error
    }
  },
  { connection, concurrency: 5 }
)

worker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed`)
})

worker.on("failed", (job, error) => {
  console.error(`Email job ${job?.id} failed:`, error)
})

export const queueEmail = async (emailData: EmailJob): Promise<string> => {
  const job = await emailQueue.add("send-email", emailData, {
    priority: emailData.priority || 3,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  })

  return job.id!
}

export const queueBulkEmails = async (
  recipients: string[],
  subject: string,
  html: string,
  priority = 3
): Promise<string[]> => {
  const jobIds: string[] = []

  for (const recipient of recipients) {
    const jobId = await queueEmail({
      to: recipient,
      subject,
      html,
      priority,
    })
    jobIds.push(jobId)
  }

  return jobIds
}

export default emailQueue
