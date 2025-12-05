import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getRazorpay } from "@/lib/razorpay"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const razorpay = getRazorpay()

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, currency, shippingAddress } = await request.json()

    if (!amount || !shippingAddress) {
      return NextResponse.json({ error: "Amount and shipping address are required" }, { status: 400 })
    }

    // Fetch cart items
    const { data: cartItems, error: cartError } = await supabase.from("cart_items").select("*").eq("user_id", user.id)

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    const shipping = 99
    const tax = Math.round(subtotal * 0.18)
    const total = subtotal + shipping + tax

    // Generate order number
    const orderNumber = `POD-${Date.now()}-${nanoid(6).toUpperCase()}`

    // Create internal order (pending payment)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        subtotal,
        shipping_cost: shipping,
        tax,
        total_amount: total,
        currency: currency || "INR",
        shipping_address: shippingAddress,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      throw new Error("Failed to create order")
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      printful_product_id: item.printful_product_id,
      printful_variant_id: item.printful_variant_id,
      product_name: item.product_name,
      variant_name: item.variant_name,
      color: item.color,
      size: item.size,
      design_url: item.design_url,
      mockup_url: item.mockup_url,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Order items creation error:", itemsError)
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount, // Amount in paise
      currency: currency || "INR",
      receipt: orderNumber,
      notes: {
        internal_order_id: order.id,
        user_id: user.id,
      },
    })

    // Update order with Razorpay order ID
    await supabase.from("orders").update({ razorpay_order_id: razorpayOrder.id }).eq("id", order.id)

    return NextResponse.json({
      orderId: razorpayOrder.id,
      internalOrderId: order.id,
      orderNumber,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    })
  } catch (error) {
    console.error("Razorpay order creation error:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
