import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CartContent } from "@/components/cart/cart-content"

export const metadata = {
  title: "Shopping Cart | Memmoire",
  description: "Review your cart and proceed to checkout",
}

export default async function CartPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login?redirect=/cart")
  }

  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Cart fetch error:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
      <CartContent initialItems={cartItems || []} userId={user.id} />
    </div>
  )
}
