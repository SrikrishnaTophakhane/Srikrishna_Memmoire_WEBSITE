import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CancelButton } from "@/components/orders/cancel-button"
import { ChevronLeft, Package, Truck, MapPin, CreditCard, ExternalLink, Banknote } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return {
    title: `Order Details | Memoire`,
    description: `View details for order ${id}`,
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "paid":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "processing":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "fulfilled":
    case "shipped":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const ORDER_STEPS = [
  { status: "pending", label: "Order Placed" },
  { status: "paid", label: "Payment Confirmed" },
  { status: "processing", label: "Processing" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
]

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login?redirect=/orders")
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !order) {
    notFound()
  }

  const shippingAddress = order.shipping_address as {
    full_name: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    phone?: string
  }

  const currentStepIndex = ORDER_STEPS.findIndex((step) => step.status === order.status)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-4">
          <CancelButton orderId={order.id} currentStatus={order.status} />
          <Badge className={`${getStatusColor(order.status)} px-4 py-2 text-sm`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Order Progress */}
      {order.status !== "cancelled" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="flex justify-between">
                {ORDER_STEPS.map((step, index) => (
                  <div
                    key={step.status}
                    className={`flex flex-col items-center ${
                      index <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        index <= currentStepIndex
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="mt-2 text-xs sm:text-sm">{step.label}</span>
                  </div>
                ))}
              </div>
              <div className="absolute left-0 top-4 h-0.5 w-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {order.tracking_url && (
              <div className="mt-6">
                <Button variant="outline" asChild>
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                    Track Package
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.order_items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.order_items?.map(
                (
                  item: {
                    id: string
                    mockup_url?: string
                    design_url?: string
                    product_name: string
                    color?: string
                    size?: string
                    quantity: number
                    unit_price: number
                  },
                  index: number,
                ) => (
                  <div key={item.id}>
                    <div className="flex gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                         {item.mockup_url || item.design_url ? (
                          <img
                            src={item.mockup_url || item.design_url || "/placeholder.svg"}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary">
                             <Package className="h-8 w-8 text-muted-foreground opacity-50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.color} / {item.size}
                        </p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{(item.unit_price * item.quantity).toFixed(0)}</p>
                    </div>
                    {index < (order.order_items?.length || 0) - 1 && <Separator className="mt-4" />}
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Shipping */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹{order.shipping_cost.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (GST)</span>
                <span>₹{order.tax.toFixed(0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{order.total_amount.toFixed(0)}</span>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  {order.payment_method === "cod" ? <Banknote className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                  Payment Method
                </span>
                <span className="font-medium">
                  {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                </span>
              </div>

              {order.razorpay_payment_id && (
                <div className="mt-4 rounded-lg bg-muted p-3 text-xs">
                  <p className="text-muted-foreground">Payment ID:</p>
                  <p className="font-mono">{order.razorpay_payment_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium">{shippingAddress.full_name}</p>
                <p className="text-muted-foreground">{shippingAddress.address_line1}</p>
                {shippingAddress.address_line2 && (
                  <p className="text-muted-foreground">{shippingAddress.address_line2}</p>
                )}
                <p className="text-muted-foreground">
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                </p>
                {shippingAddress.phone && <p className="mt-2 text-muted-foreground">Phone: {shippingAddress.phone}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-sm text-muted-foreground">Need help with your order?</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
