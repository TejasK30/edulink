import { Queue } from "bullmq"
import { redis } from "./redis"

export const emailQueue = new Queue("emailQueue", { connection: redis })

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
