"use client"

import FeePaymentForm from "@/components/finance/feePayment"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/providers/auth-provider"
import { feeApi } from "@/services/fee"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function FeePaymentPage() {
  const router = useRouter()
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const { user: currentUser } = useAuth()

  const handlePaymentSuccess = (id: string) => {
    setPaymentId(id)
    setPaymentSuccess(true)
  }

  const handleViewHistory = () => {
    router.push("/dashboard/student/payment-history")
  }

  const handleDownloadReceipt = () => {
    if (paymentId) {
      window.open(feeApi.downloadReceipt(paymentId), "_blank")
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Fee Payment</h1>

      {paymentSuccess ? (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              Payment Successful!
            </AlertTitle>
            <AlertDescription className="text-green-700">
              Your payment has been processed successfully. A receipt has been
              sent to your email.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4 mt-6">
            <Button onClick={handleDownloadReceipt}>Download Receipt</Button>
            <Button variant="outline" onClick={handleViewHistory}>
              View Payment History
            </Button>
          </div>
        </div>
      ) : (
        <FeePaymentForm
          userId={currentUser?.id as string}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
