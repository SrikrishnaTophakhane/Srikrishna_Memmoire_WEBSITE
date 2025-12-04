import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata = {
  title: "Checkout | Memmoire",
  description: "Complete your order",
}

export default async function CheckoutPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login?redirect=/checkout")
  }

  // Fetch cart items
  const { data: cartItems, error: cartError } = await supabase.from("cart_items").select("*").eq("user_id", user.id)

  if (cartError || !cartItems || cartItems.length === 0) {
    redirect("/cart")
  }

  // Fetch user addresses
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      <CheckoutForm
        cartItems={cartItems}
        addresses={addresses || []}
        user={{ id: user.id, email: user.email || "", ...profile }}
      />
    </div>
  )
}
