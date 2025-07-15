import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  FeeType,
  FeeTypeInfo,
  InstallmentOption,
  PaymentMethod,
  PaymentMethodInfo,
  PaymentStatus,
  formatCurrency,
  PaymentDetails as PaymentDetailsType,
} from "@/lib/types"
import { AlertCircle, Loader2 } from "lucide-react"
import { feeApi } from "@/services/fee"
import {
  cardPaymentSchema,
  feesSchema,
  netBankingSchema,
  upiPaymentSchema,
  walletSchema,
} from "@/lib/schemas/fee.schema"

type FeeFormValues = z.infer<typeof feesSchema>
type CardPaymentFormValues = z.infer<typeof cardPaymentSchema>
type UpiPaymentFormValues = z.infer<typeof upiPaymentSchema>
type NetBankingFormValues = z.infer<typeof netBankingSchema>
type WalletFormValues = z.infer<typeof walletSchema>

interface FeePaymentFormProps {
  userId: string
  onPaymentSuccess: (paymentId: string) => void
}

enum PaymentStep {
  SELECT_FEES = 0,
  PAYMENT_METHOD = 1,
  VERIFY_OTP = 2,
  PROCESSING = 3,
  COMPLETE = 4,
}

export default function FeePaymentForm({
  userId,
  onPaymentSuccess,
}: FeePaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFees, setSelectedFees] = useState<FeeType[]>([])
  const [currentStep, setCurrentStep] = useState<PaymentStep>(
    PaymentStep.SELECT_FEES
  )
  const [otp, setOtp] = useState<string>("")
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [_requiresOTP, setRequiresOTP] = useState<boolean>(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null)
  const [surchargePercentage, setSurchargePercentage] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)

  const [feeTypes, setFeeTypes] = useState<FeeTypeInfo[]>([])
  const [installmentOptions, setInstallmentOptions] = useState<
    InstallmentOption[]
  >([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>([])

  const feeForm = useForm<FeeFormValues>({
    resolver: zodResolver(feesSchema),
    defaultValues: { feeTypes: [], installmentOption: "1" },
  })

  const cardForm = useForm<CardPaymentFormValues>({
    resolver: zodResolver(cardPaymentSchema),
  })
  const upiForm = useForm<UpiPaymentFormValues>({
    resolver: zodResolver(upiPaymentSchema),
  })
  const netBankingForm = useForm<NetBankingFormValues>({
    resolver: zodResolver(netBankingSchema),
  })
  const walletForm = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        const ft = await feeApi.getFeeTypes()
        setFeeTypes(ft.data.feeTypes)
        const io = await feeApi.getInstallmentOptions()
        setInstallmentOptions(io.data.installmentOptions)
        setSurchargePercentage(io.data.surchargePercentage)
        const pm = await feeApi.getPaymentMethods()
        setPaymentMethods(pm.data.paymentMethods)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load fee information"
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    const values = [0, 25, 50, 75, 100]
    setProgress(values[currentStep])
  }, [currentStep])

  const calculateTotal = (withSurcharge = false) => {
    const base = selectedFees.reduce((sum, t) => {
      const f = feeTypes.find((f) => f.value === t)
      return sum + (f ? f.amount : 0)
    }, 0)
    if (!withSurcharge) return base
    const inst = parseInt(feeForm.watch("installmentOption") || "1")
    return inst > 1 ? base * (1 + surchargePercentage / 100) : base
  }

  const calculateInstallmentAmount = () => {
    const total = calculateTotal(true)
    const inst = parseInt(feeForm.watch("installmentOption") || "1")
    return inst === 1 ? total : Math.ceil(total / inst)
  }

  const handleCheckboxChange = (fee: FeeType, checked: boolean) => {
    const updated = checked
      ? [...selectedFees, fee]
      : selectedFees.filter((f) => f !== fee)
    setSelectedFees(updated)
    feeForm.setValue("feeTypes", updated, { shouldValidate: true })
  }

  const handleFeesSubmit = feeForm.handleSubmit(async (data) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await feeApi.initiatePayment(
        userId,
        data.feeTypes,
        parseInt(data.installmentOption),
        1
      )
      setPaymentId(res.data.payment._id)
      console.log(`Payment id: ${res.data.payment._id}`)
      setCurrentStep(PaymentStep.PAYMENT_METHOD)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error initiating payment")
    } finally {
      setIsLoading(false)
    }
  })

  const handlePaymentMethodSubmit = async () => {
    if (!selectedPaymentMethod || !paymentId) {
      setError("Please select a payment method")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      let details: PaymentDetailsType
      switch (selectedPaymentMethod) {
        case PaymentMethod.CARD:
          if (!(await cardForm.trigger())) return
          details = cardForm.getValues()
          break
        case PaymentMethod.UPI:
          if (!(await upiForm.trigger())) return
          details = upiForm.getValues()
          break
        case PaymentMethod.NET_BANKING:
          if (!(await netBankingForm.trigger())) return
          details = netBankingForm.getValues()
          break
        case PaymentMethod.WALLET:
          if (!(await walletForm.trigger())) return
          details = walletForm.getValues()
          break
        default:
          setError("Invalid method")
          return
      }
      const resp = await feeApi.processPayment(
        paymentId,
        selectedPaymentMethod,
        details
      )
      if (resp.data.requiresOTP) {
        setRequiresOTP(true)
        setCurrentStep(PaymentStep.VERIFY_OTP)
      } else {
        setCurrentStep(PaymentStep.PROCESSING)
        await completePayment()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing payment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!paymentId || otp.length < 6) {
      setError("Please enter the OTP")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await feeApi.verifyOTP(paymentId, otp)
      setCurrentStep(PaymentStep.PROCESSING)
      await completePayment()
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const completePayment = async () => {
    if (!paymentId) {
      setError("Payment ID not found")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await feeApi.completePayment(paymentId)
      if (res.data.payment.paymentStatus === PaymentStatus.COMPLETED) {
        setCurrentStep(PaymentStep.COMPLETE)
        onPaymentSuccess(paymentId)
      } else {
        setError(
          `Payment failed: ${res.data.payment.failureReason || "Unknown"}`
        )
        setCurrentStep(PaymentStep.PAYMENT_METHOD)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error completing payment")
      setCurrentStep(PaymentStep.PAYMENT_METHOD)
    } finally {
      setIsLoading(false)
    }
  }

  const renderPaymentMethodForm = () => {
    if (!selectedPaymentMethod) return null
    switch (selectedPaymentMethod) {
      case PaymentMethod.CARD:
        return (
          <form className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                {...cardForm.register("cardNumber")}
              />
              {cardForm.formState.errors.cardNumber && (
                <p className="text-red-500">
                  {cardForm.formState.errors.cardNumber.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="cardHolderName">Cardholder Name</Label>
              <Input
                id="cardHolderName"
                placeholder="Name on card"
                {...cardForm.register("cardHolderName")}
              />
              {cardForm.formState.errors.cardHolderName && (
                <p className="text-red-500">
                  {cardForm.formState.errors.cardHolderName.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expiryMonth">Month</Label>
                <Select
                  onValueChange={(v) => cardForm.setValue("expiryMonth", v)}
                >
                  <SelectTrigger id="expiryMonth">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i + 1).padStart(2, "0")
                      return (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {cardForm.formState.errors.expiryMonth && (
                  <p className="text-red-500">
                    {cardForm.formState.errors.expiryMonth.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="expiryYear">Year</Label>
                <Select
                  onValueChange={(v) => cardForm.setValue("expiryYear", v)}
                >
                  <SelectTrigger id="expiryYear">
                    <SelectValue placeholder="YY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const y = String(new Date().getFullYear() + i).slice(-2)
                      return (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {cardForm.formState.errors.expiryYear && (
                  <p className="text-red-500">
                    {cardForm.formState.errors.expiryYear.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  {...cardForm.register("cvv")}
                />
                {cardForm.formState.errors.cvv && (
                  <p className="text-red-500">
                    {cardForm.formState.errors.cvv.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        )
      case PaymentMethod.UPI:
        return (
          <form>
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="name@upi"
              {...upiForm.register("upiId")}
            />
            {upiForm.formState.errors.upiId && (
              <p className="text-red-500">
                {upiForm.formState.errors.upiId.message}
              </p>
            )}
          </form>
        )
      case PaymentMethod.NET_BANKING:
        const bankOpts =
          paymentMethods.find((m) => m.type === PaymentMethod.NET_BANKING)
            ?.options || []
        return (
          <form>
            <Label htmlFor="bankCode">Select Bank</Label>
            <Select
              onValueChange={(v) => netBankingForm.setValue("bankCode", v)}
            >
              <SelectTrigger id="bankCode">
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                {bankOpts.map((b) => (
                  <SelectItem key={b.code} value={b.code}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {netBankingForm.formState.errors.bankCode && (
              <p className="text-red-500">
                {netBankingForm.formState.errors.bankCode.message}
              </p>
            )}
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Net banking username"
              {...netBankingForm.register("username")}
            />
            {netBankingForm.formState.errors.username && (
              <p className="text-red-500">
                {netBankingForm.formState.errors.username.message}
              </p>
            )}
          </form>
        )
      case PaymentMethod.WALLET:
        const walletOpts =
          paymentMethods.find((m) => m.type === PaymentMethod.WALLET)
            ?.options || []
        return (
          <form>
            <Label htmlFor="walletType">Select Wallet</Label>
            <Select onValueChange={(v) => walletForm.setValue("walletType", v)}>
              <SelectTrigger id="walletType">
                <SelectValue placeholder="Select your wallet" />
              </SelectTrigger>
              <SelectContent>
                {walletOpts.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {walletForm.formState.errors.walletType && (
              <p className="text-red-500">
                {walletForm.formState.errors.walletType.message}
              </p>
            )}
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              placeholder="10-digit mobile number"
              {...walletForm.register("mobileNumber")}
            />
            {walletForm.formState.errors.mobileNumber && (
              <p className="text-red-500">
                {walletForm.formState.errors.mobileNumber.message}
              </p>
            )}
          </form>
        )
      default:
        return null
    }
  }

  const renderFeeSelection = () => (
    <form onSubmit={handleFeesSubmit}>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Select Fees to Pay</h3>
          {feeTypes.map((fee) => (
            <div key={fee.value} className="flex items-center space-x-2">
              <Checkbox
                id={`fee-${fee.value}`}
                checked={selectedFees.includes(fee.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(fee.value, checked === true)
                }
              />
              <div className="flex justify-between w-full">
                <Label htmlFor={`fee-${fee.value}`}>{fee.label} Fee</Label>
                <span className="text-sm font-medium">
                  {formatCurrency(fee.amount)}
                </span>
              </div>
            </div>
          ))}
          {feeForm.formState.errors.feeTypes && (
            <p className="text-sm font-medium text-red-500">
              {feeForm.formState.errors.feeTypes.message}
            </p>
          )}
        </div>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Select Payment Plan</h3>
          <RadioGroup
            defaultValue="1"
            onValueChange={(v) => feeForm.setValue("installmentOption", v)}
          >
            {installmentOptions.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={opt.value.toString()}
                  id={`installment-${opt.value}`}
                />
                <Label htmlFor={`installment-${opt.value}`}>
                  {opt.label}
                  {opt.value > 1 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (+{surchargePercentage}% surcharge)
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <span className="text-base font-semibold">Base Amount</span>
            <span className="text-base">
              {formatCurrency(calculateTotal(false))}
            </span>
          </div>
          {parseInt(feeForm.watch("installmentOption") || "1") > 1 && (
            <div className="flex justify-between text-amber-600">
              <span className="text-sm">
                Installment Surcharge ({surchargePercentage}%)
              </span>
              <span className="text-sm">
                +{formatCurrency(calculateTotal(true) - calculateTotal(false))}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2">
            <span>
              {parseInt(feeForm.watch("installmentOption") || "1") > 1
                ? "First Installment Amount"
                : "Total Amount"}
            </span>
            <span>{formatCurrency(calculateInstallmentAmount())}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || selectedFees.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue to Payment"
          )}
        </Button>
      </CardFooter>
    </form>
  )

  const renderPaymentMethodSelection = () => (
    <>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <h3 className="text-lg font-medium mb-4">Select Payment Method</h3>
        <Tabs
          defaultValue={PaymentMethod.CARD}
          onValueChange={(v) => setSelectedPaymentMethod(v as PaymentMethod)}
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value={PaymentMethod.CARD}>Card</TabsTrigger>
            <TabsTrigger value={PaymentMethod.UPI}>UPI</TabsTrigger>
            <TabsTrigger value={PaymentMethod.NET_BANKING}>
              Net Banking
            </TabsTrigger>
          </TabsList>
          <TabsContent value={PaymentMethod.CARD}>
            {renderPaymentMethodForm()}
          </TabsContent>
          <TabsContent value={PaymentMethod.UPI}>
            {renderPaymentMethodForm()}
          </TabsContent>
          <TabsContent value={PaymentMethod.NET_BANKING}>
            {renderPaymentMethodForm()}
          </TabsContent>
        </Tabs>
        <div className="pt-4 border-t flex justify-between font-bold">
          <span>Amount to Pay</span>
          <span>{formatCurrency(calculateInstallmentAmount())}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          className="w-full"
          type="button"
          onClick={handlePaymentMethodSubmit}
          disabled={isLoading || !selectedPaymentMethod}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Make Payment"
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setCurrentStep(PaymentStep.SELECT_FEES)}
        >
          Back
        </Button>
      </CardFooter>
    </>
  )

  const renderOtpVerification = () => (
    <>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">OTP Verification</h3>
          <p className="text-muted-foreground mb-6">
            Enter the One-Time Password sent to your registered mobile number
          </p>
          <Input
            className="text-center text-xl tracking-widest w-40"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="Enter OTP"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          className="w-full"
          onClick={handleVerifyOTP}
          disabled={isLoading || otp.length < 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setCurrentStep(PaymentStep.PAYMENT_METHOD)}
        >
          Back
        </Button>
      </CardFooter>
    </>
  )

  const renderProcessing = () => (
    <CardContent className="py-10">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h3 className="text-xl font-medium">Processing Payment</h3>
        <p className="text-muted-foreground text-center">
          Please wait while we process your payment. Do not close this window.
        </p>
      </div>
    </CardContent>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fee Payment</CardTitle>
        <CardDescription>Complete your fee payment securely</CardDescription>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Select Fees</span>
            <span>Payment Method</span>
            <span>Verification</span>
            <span>Complete</span>
          </div>
        </div>
      </CardHeader>
      {currentStep === PaymentStep.SELECT_FEES && renderFeeSelection()}
      {currentStep === PaymentStep.PAYMENT_METHOD &&
        renderPaymentMethodSelection()}
      {currentStep === PaymentStep.VERIFY_OTP && renderOtpVerification()}
      {currentStep === PaymentStep.PROCESSING && renderProcessing()}
    </Card>
  )
}
