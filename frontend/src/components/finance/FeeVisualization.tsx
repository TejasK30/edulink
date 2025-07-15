import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/providers/auth-provider"
import { formatCurrency } from "@/lib/types"
import { feeApi } from "@/services/fee"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

interface StudentInfo {
  _id: string
  name: string
  email: string
}
interface DepartmentInfo {
  _id: string
  name: string
}
interface PaymentWithStudent {
  _id: string
  transactionId: string
  student: StudentInfo
  department: DepartmentInfo
  paymentDate: string
  amountPaid: number
}
interface FeeTypeSummary {
  feeType: string
  totalAmount: number
  count: number
}
interface MonthlyData {
  year: number
  month: number
  totalAmount: number
  count: number
}
interface PaymentSummary {
  feeSummary: FeeTypeSummary[]
  paymentMethodSummary: { method: string; totalAmount: number; count: number }[]
  installmentSummary: {
    isInstallment: boolean
    totalAmount: number
    count: number
  }[]
  monthlyData: MonthlyData[]
}

const CustomBarTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border text-foreground p-2 rounded shadow-md">
        <p className="text-sm font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm">
            {entry.name}: {formatCurrency(entry.value as number)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const entry = payload[0]
    return (
      <div className="border p-2 rounded shadow">
        <p className="text-sm font-semibold">{entry.name}</p>
        <p className="text-sm">{formatCurrency(entry.value as number)}</p>
      </div>
    )
  }
  return null
}

export default function FeeVisualization() {
  const [payments, setPayments] = useState<PaymentWithStudent[]>([])
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return
      try {
        setIsLoading(true)
        const paymentsRes = await feeApi.getAllPayments(currentUser.id)
        setPayments(paymentsRes.data.payments)
        const summaryRes = await feeApi.getPaymentSummary(currentUser.id)
        setSummary(summaryRes.data)
      } catch (err: any) {
        setError(err.response?.data?.message ?? "Failed to load payment data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [currentUser?.id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const prepareMonthlyData = () =>
    summary?.monthlyData.map((d) => ({
      name: `${MONTH_NAMES[d.month - 1]} ${d.year}`,
      amount: d.totalAmount,
      count: d.count,
    })) ?? []

  const preparePieData = () =>
    summary?.feeSummary.map((item) => ({
      name: item.feeType.charAt(0).toUpperCase() + item.feeType.slice(1),
      value: item.totalAmount,
    })) ?? []

  return (
    <>
      <style jsx global>{`
        .recharts-rectangle:hover {
          fill: #8a2be2 !important;
          stroke: #8a2be2 !important;
        }
      `}</style>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Fee Payment Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="charts">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="table">Payment Records</TabsTrigger>
              </TabsList>
              <TabsContent value="charts" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Monthly Fee Collection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prepareMonthlyData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                          <ReTooltip content={<CustomBarTooltip />} />
                          <Legend />
                          <Bar
                            dataKey="amount"
                            name="Total Collection"
                            fill="#8a2be2"
                            stroke="#8a2be2"
                            strokeWidth={0}
                            fillOpacity={1}
                            cursor="default"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Fee Type Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={preparePieData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) =>
                              `${name}: ${formatCurrency(
                                (percent || 0) *
                                  summary!.monthlyData.reduce(
                                    (a, b) => a + b.totalAmount,
                                    0
                                  )
                              )}`
                            }
                          >
                            {preparePieData().map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <ReTooltip content={<CustomPieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Fee Collection Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fee Type</TableHead>
                          <TableHead className="text-right">
                            Total Collections
                          </TableHead>
                          <TableHead className="text-right">
                            Number of Payments
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary?.feeSummary.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              {item.feeType.charAt(0).toUpperCase() +
                                item.feeType.slice(1)}{" "}
                              Fee
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.totalAmount)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.count}
                            </TableCell>
                          </TableRow>
                        ))}
                        {summary && (
                          <TableRow className="font-bold">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(
                                summary.feeSummary.reduce(
                                  (tot, i) => tot + i.totalAmount,
                                  0
                                )
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {summary.feeSummary.reduce(
                                (tot, i) => tot + i.count,
                                0
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="table">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableCaption>All fee payments</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment._id}>
                            <TableCell className="font-medium">
                              {payment.transactionId}
                            </TableCell>
                            <TableCell>
                              {payment.student.name}
                              <br />
                              <span className="text-xs text-gray-500">
                                {payment.student.email}
                              </span>
                            </TableCell>
                            <TableCell>{payment.department.name}</TableCell>
                            <TableCell>
                              {new Date(
                                payment.paymentDate
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(payment.amountPaid)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
