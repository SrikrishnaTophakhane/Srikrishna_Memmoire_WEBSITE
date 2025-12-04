"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/components/cart/cart-item"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react"
import type { CartItem as CartItemType } from "@/types"

interface CartContentProps {
  initialItems: CartItemType[]
  userId: string
}

export function CartContent({ initialItems, userId }: CartContentProps) {
  const router = useRouter()
  const [items, setItems] = useState<CartItemType[]>(initialItems)
  const [isClearing, setIsClearing] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const shipping = items.length > 0 ? 99 : 0 // Flat shipping rate
  const total = subtotal + shipping

  async function updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return

    const supabase = createClient()
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", itemId)
      .eq("user_id", userId)

    if (error) {
      toast.error("Failed to update quantity")
      return
    }

    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  async function removeItem(itemId: string) {
    const supabase = createClient()
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId).eq("user_id", userId)

    if (error) {
      toast.error("Failed to remove item")
      return
    }

    setItems((prev) => prev.filter((item) => item.id !== itemId))
    toast.success("Item removed from cart")
    router.refresh()
  }

  async function clearCart() {
    setIsClearing(true)
    const supabase = createClient()
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

    if (error) {
      toast.error("Failed to clear cart")
      setIsClearing(false)
      return
    }

    setItems([])
    toast.success("Cart cleared")
    router.refresh()
    setIsClearing(false)
  }

  if (items.length === 0) {
    return (
      <Card className="text-center">
        <CardContent className="py-16">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">Start by adding some custom products!</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cart Items ({items.length})</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              disabled={isClearing}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id}>
                <CartItem item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
                {index < items.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping > 0 ? `₹${shipping}` : "Free"}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
