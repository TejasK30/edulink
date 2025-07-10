"use client"

import PaymentHistoryTable from "@/components/PaymentHistoryTable"
import { useAuth } from "@/lib/auth-provider"

export default function PaymentHistoryPage() {
  const { user: currentUser } = useAuth()

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Payment History</h1>
      <PaymentHistoryTable userId={currentUser?.id as string} />
    </div>
  )
}
