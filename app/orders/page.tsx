import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ChevronRight, ShoppingBag } from "lucide-react"
import { getProductById } from "@/lib/products-data"

export const metadata = {
  title: "My Orders | Memmoire",
  description: "View and track your orders",
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
    month: "short",
    year: "numeric",
  })
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login?redirect=/orders")
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Orders fetch error:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <Card className="text-center">
          <CardContent className="py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">No orders yet</h2>
            <p className="mb-6 text-muted-foreground">Start shopping to see your orders here</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{order.order_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {order.order_items
                        ?.slice(0, 3)
                        .map((item: {
                          id: string;
                          mockup_url?: string;
                          design_url?: string;
                          product_name: string;
                          printful_product_id: number;
                          color?: string;
                        }) => {
                          const product = getProductById(item.printful_product_id)
                          const productImage = product?.colorImages?.[item.color || ""] || product?.image
                          return (
                          <div key={item.id} className="h-12 w-12 overflow-hidden rounded bg-muted">
                            <img
                              src={item.mockup_url || item.design_url || productImage || "/placeholder.svg"}
                              alt={item.product_name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )})}
                      {order.order_items && order.order_items.length > 3 && (
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-sm font-medium">
                          +{order.order_items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.total_amount.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground">{order.order_items?.length || 0} items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
