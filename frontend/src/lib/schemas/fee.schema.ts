import { z } from "zod"

export const feesSchema = z.object({
  feeTypes: z
    .array(z.string())
    .min(1, { message: "Please select at least one fee type" }),
  installmentOption: z.string().default("1"),
})

export const cardPaymentSchema = z.object({
  cardNumber: z.string().min(16).max(16),
  cardHolderName: z.string().min(3),
  expiryMonth: z.string().min(1),
  expiryYear: z.string().min(1),
  cvv: z.string().min(3).max(4),
})

export const upiPaymentSchema = z.object({
  upiId: z
    .string()
    .min(5)
    .refine((v) => v.includes("@")),
})

export const netBankingSchema = z.object({
  bankCode: z.string().min(1),
  username: z.string().min(3),
})

export const walletSchema = z.object({
  walletType: z.string().min(1),
  mobileNumber: z.string().min(10),
})
