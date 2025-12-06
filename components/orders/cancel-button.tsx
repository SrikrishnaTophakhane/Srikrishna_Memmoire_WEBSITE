"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CancelButtonProps {
  orderId: string
  currentStatus: string
}

export function CancelButton({ orderId, currentStatus }: CancelButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isCancelling, setIsCancelling] = useState(false)

  const isCancellable = ["pending", "paid", "processing"].includes(currentStatus)

  if (!isCancellable) {
    return null
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return
    }

    setIsCancelling(true)

    try {
      const response = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to cancel order")
      }

      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Cancellation error:", error)
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel order",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleCancel}
      disabled={isCancelling}
      className="gap-2"
    >
      {isCancelling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      Cancel Order
    </Button>
  )
}
