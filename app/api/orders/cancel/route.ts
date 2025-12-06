import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Fetch order to check ownership and status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("status, user_id")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const cancellableStatuses = ["pending", "paid", "processing"]

    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order with status: ${order.status}` },
        { status: 400 }
      )
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)

    if (updateError) {
      console.error("Order cancellation error:", updateError)
      throw new Error("Failed to cancel order")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancellation error:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
