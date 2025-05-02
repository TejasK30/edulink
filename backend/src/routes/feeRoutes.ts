import { Router } from "express"
import * as feeController from "../controllers/feeController"

const router = Router()

// generaal fee info routes
router.get("/types", feeController.getFeeTypes)
router.get("/installment-options", feeController.getInstallmentOptions)
router.get("/payment-methods", feeController.getPaymentMethods)

// Student payment routes
router.post("/payment/initiate/:userId", feeController.initiatePayment)
router.post("/payment/process/:paymentId", feeController.processPayment)
router.post("/payment/verify-otp/:paymentId", feeController.verifyOTP)
router.post("/payment/complete/:paymentId", feeController.completePayment)
router.get("/payment/status/:paymentId", feeController.getPaymentStatus)

// Student info and history routes
router.get("/history/:userId", feeController.getPaymentHistory)
router.get("/pending/:userId", feeController.getPendingInstallments)
router.get("/receipt/:paymentId", feeController.downloadReceipt)
router.get("/dues/:userId", feeController.getUserDues)

// Notification settings
router.post(
  "/notifications/settings/:userId",
  feeController.updateNotificationSettings
)
router.get(
  "/notifications/settings/:userId",
  feeController.getNotificationSettings
)

// Admin routes
router.get("/admin/:userId/all", feeController.getAllFeePayments)
router.get("/admin/:userId/summary", feeController.getFeePaymentSummary)
router.get("/failed", feeController.getFailedPayments)
router.get("/due-installments", feeController.getDueInstallments)
router.post("/reminders/send", feeController.sendPaymentReminders)

export default router
