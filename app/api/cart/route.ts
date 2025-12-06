import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

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

    const body = await request.json()
    const {
      printful_product_id,
      printful_variant_id,
      product_name,
      variant_name,
      color,
      size,
      design_url,
      mockup_url,
      quantity,
      unit_price,
      design_config,
    } = body

    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        printful_product_id,
        printful_variant_id,
        product_name,
        variant_name,
        color,
        size,
        design_url: design_url || null,
        mockup_url: mockup_url || null,
        quantity: quantity || 1,
        unit_price,
        design_config,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error("Cart add error:", error)
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("id")

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("cart_items").delete().eq("id", itemId).eq("user_id", user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart delete error:", error)
    return NextResponse.json({ error: "Failed to remove item from cart" }, { status: 500 })
  }
}
