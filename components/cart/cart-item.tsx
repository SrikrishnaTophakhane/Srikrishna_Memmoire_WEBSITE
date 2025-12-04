"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem as CartItemType } from "@/types"

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4">
      {/* Product Image with Design */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.mockup_url ? (
          <img
            src={item.mockup_url || "/placeholder.svg"}
            alt={item.product_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <img src={item.design_url || "/placeholder.svg"} alt="Your design" className="h-16 w-16 object-contain" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-medium line-clamp-1">{item.product_name}</h3>
          <p className="text-sm text-muted-foreground">
            {item.color} / {item.size}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
              className="h-8 w-14 text-center"
              min={1}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>

          {/* Price and Remove */}
          <div className="flex items-center gap-4">
            <p className="font-semibold">₹{(item.unit_price * item.quantity).toFixed(0)}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove item</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
