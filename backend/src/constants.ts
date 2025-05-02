export const FEE_AMOUNTS = {
  TUITION: 50000,
  EXAM: 2000,
  HOSTEL: 10000,
}

export const INSTALLMENT_OPTIONS = [
  { value: 1, label: "Full Payment (No installments)" },
  { value: 2, label: "2 Installments" },
  { value: 3, label: "3 Installments" },
  { value: 4, label: "4 Installments (Quarterly)" },
]

export const INSTALLMENT_SURCHARGE_PERCENTAGE = 5

export const CURRENCY = "INR"

export const SIMULATED_PAYMENT_DELAY = 2000
export const OTP_VALIDATION_DELAY = 1000
export const OTP_EXPIRY_TIME = 5 * 60 * 1000

export const BANK_OPTIONS = [
  { code: "SBI", name: "State Bank of India" },
  { code: "HDFC", name: "HDFC Bank" },
  { code: "ICICI", name: "ICICI Bank" },
  { code: "AXIS", name: "Axis Bank" },
  { code: "KOTAK", name: "Kotak Mahindra Bank" },
  { code: "BOB", name: "Bank of Baroda" },
  { code: "PNB", name: "Punjab National Bank" },
  { code: "IDBI", name: "IDBI Bank" },
  { code: "CANARA", name: "Canara Bank" },
  { code: "YES", name: "Yes Bank" },
]

export const WALLET_OPTIONS = [
  { code: "PAYTM", name: "Paytm" },
  { code: "PHONEPE", name: "PhonePe" },
  { code: "GPAY", name: "Google Pay" },
  { code: "MOBIKWIK", name: "MobiKwik" },
  { code: "FREECHARGE", name: "Freecharge" },
]

export const RECEIPT_VALIDITY_DAYS = 180
