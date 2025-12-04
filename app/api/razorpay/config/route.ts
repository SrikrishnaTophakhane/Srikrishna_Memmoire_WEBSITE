import { NextResponse } from "next/server"

// This endpoint returns the public Razorpay key ID
// The key ID is meant to be public (like Stripe's publishable key)
export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID

  if (!keyId) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 })
  }

  return NextResponse.json({ keyId })
}
