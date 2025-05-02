import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { feeApi } from "@/lib/api"
import { AlertCircle, Download, ExternalLink, Loader2 } from "lucide-react"
import {
  formatCurrency,
  FeePayment,
  PaymentStatus,
  PaymentMethodLabels,
  PaymentStatusLabels,
  FeeTypeLabels,
} from "@/lib/types"

interface PaymentHistoryTableProps {
  userId: string
}

export default function PaymentHistoryTable({
  userId,
}: PaymentHistoryTableProps) {
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await feeApi.getPaymentHistory(userId)
      setPayments(response.data.payments)
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch payment history"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (receiptUrl: string | undefined) => {
    if (receiptUrl) {
      window.open(receiptUrl, "_blank")
    }
  }

  const getStatusBadgeVariant = (
    status: PaymentStatus
  ): "default" | "outline" | "secondary" | "destructive" => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return "default"
      case PaymentStatus.PENDING:
        return "outline"
      case PaymentStatus.PROCESSING:
        return "secondary"
      case PaymentStatus.FAILED:
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View your past fee payments</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : payments.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No payment history found.
          </div>
        ) : (
          <Table>
            <TableCaption>Your payment history</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {payment.transactionId}
                  </TableCell>
                  <TableCell>
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {payment.feeTypes.map((feeType) => (
                        <Badge
                          key={feeType}
                          variant="outline"
                          className="w-fit"
                        >
                          {FeeTypeLabels[feeType]}
                        </Badge>
                      ))}
                      {payment.installmentDetails && (
                        <span className="text-xs text-muted-foreground mt-1">
                          Installment{" "}
                          {payment.installmentDetails.currentInstallment} of{" "}
                          {payment.installmentDetails.totalInstallments}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    {payment.paymentMethod
                      ? PaymentMethodLabels[payment.paymentMethod]
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(payment.paymentStatus)}
                    >
                      {PaymentStatusLabels[payment.paymentStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.paymentStatus === PaymentStatus.COMPLETED ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(payment.receiptUrl)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Receipt
                      </Button>
                    ) : payment.paymentStatus === PaymentStatus.PENDING &&
                      payment.paymentGatewayUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (payment.paymentGatewayUrl) {
                            window.open(payment.paymentGatewayUrl, "_blank")
                          }
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
