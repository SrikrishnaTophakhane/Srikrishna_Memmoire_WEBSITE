import Razorpay from "razorpay"
import crypto from "crypto"

// Helper to initialize Razorpay lazily
export const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing")
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

export interface CreateOrderOptions {
  amount: number // in paise (INR) or smallest currency unit
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder(options: CreateOrderOptions) {
  const { amount, currency = "INR", receipt, notes } = options
  const razorpay = getRazorpay()

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes,
  })

  return order
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay secret is missing")
  }

  const body = orderId + "|" + paymentId
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex")

  return expectedSignature === signature
}

export async function fetchPaymentDetails(paymentId: string) {
  const razorpay = getRazorpay()
  return razorpay.payments.fetch(paymentId)
}
