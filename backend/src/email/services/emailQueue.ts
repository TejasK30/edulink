import { Queue } from "bullmq"
import { connection } from "../config/redis"

export const emailQueue = new Queue("emailQueue", { connection })

export interface EmailJobData {
  type: "paymentConfirmation" | "paymentReminder"
  studentId: string
  feeRecordId: string
}

export const addEmailJob = async (data: EmailJobData) => {
  await emailQueue.add(`email-${data.type}-${data.feeRecordId}`, data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000 * 60,
    },
  })
}
