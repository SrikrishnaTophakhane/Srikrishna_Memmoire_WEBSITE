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

    const { data: addresses, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })

    if (error) throw error

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error("Addresses fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
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
    const { full_name, address_line1, address_line2, city, state, postal_code, country, phone, is_default } = body

    // Validate required fields
    if (!full_name || !address_line1 || !city || !state || !postal_code || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
    }

    const { data: address, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        full_name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country: country || "IN",
        phone,
        is_default: is_default || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ address })
  } catch (error) {
    console.error("Address creation error:", error)
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
  }
}
