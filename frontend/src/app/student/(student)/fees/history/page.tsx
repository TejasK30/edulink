"use client"

import PaymentHistoryTable from "@/components/PaymentHistoryTable"
import { useAppStore } from "@/lib/store"

export default function PaymentHistoryPage() {
  const { currentUser } = useAppStore()
  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Payment History</h1>
      <PaymentHistoryTable userId={currentUser?._id as string} />
    </div>
  )
}
