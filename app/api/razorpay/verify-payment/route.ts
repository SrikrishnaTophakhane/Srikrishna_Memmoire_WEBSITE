import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = await request.json()

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(body).digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Update order status
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", internal_order_id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Order update error:", updateError)
      throw new Error("Failed to update order")
    }

    // Clear cart
    await supabase.from("cart_items").delete().eq("user_id", user.id)

    // In production, you would also:
    // 1. Create order in Printful
    // 2. Send confirmation email
    // 3. Trigger any webhooks

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
