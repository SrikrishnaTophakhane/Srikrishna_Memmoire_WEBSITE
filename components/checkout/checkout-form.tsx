"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MapPin, Plus, CreditCard, Shield } from "lucide-react"
import type { CartItem, Address } from "@/types"

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
    contact?: string
  }
  theme: {
    color: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayInstance {
  open: () => void
  on: (event: string, callback: (response: { error: { description: string } }) => void) => void
}

interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface CheckoutFormProps {
  cartItems: CartItem[]
  addresses: Address[]
  user: { id: string; email: string; full_name?: string; phone?: string }
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
]

export function CheckoutForm({ cartItems, addresses, user }: CheckoutFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay")
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.is_default)?.id || addresses[0]?.id || null,
  )
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0)

  const [newAddress, setNewAddress] = useState({
    full_name: user.full_name || "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "IN",
    phone: user.phone || "",
  })

  useEffect(() => {
    async function fetchRazorpayKey() {
      try {
        const response = await fetch("/api/razorpay/config")
        if (response.ok) {
          const { keyId } = await response.json()
          setRazorpayKeyId(keyId)
        }
      } catch (error) {
        console.error("Failed to fetch Razorpay config:", error)
      }
    }
    fetchRazorpayKey()
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const shipping = 99 // Flat shipping rate
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + shipping + tax

  async function handlePlaceOrder() {
    if (paymentMethod === "razorpay" && !razorpayKeyId) {
      toast({
        title: "Error",
        description: "Payment system not ready. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Get or create shipping address
      let shippingAddress: Address

      if (showNewAddress || !selectedAddressId) {
        // Validate new address
        if (
          !newAddress.full_name ||
          !newAddress.address_line1 ||
          !newAddress.city ||
          !newAddress.state ||
          !newAddress.postal_code ||
          !newAddress.phone
        ) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required address fields",
            variant: "destructive",
          })
          setIsProcessing(false)
          return
        }

        // Save new address via API
        const addressResponse = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAddress),
        })

        if (!addressResponse.ok) {
          throw new Error("Failed to save address")
        }

        const { address } = await addressResponse.json()
        shippingAddress = address
      } else {
        shippingAddress = addresses.find((a) => a.id === selectedAddressId)!
      }

      // Create order
      const orderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Amount in paise
          currency: "INR",
          shippingAddress,
          paymentMethod,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create order")
      }

      const responseData = await orderResponse.json()

      if (paymentMethod === "cod") {
        toast({
          title: "Order Placed",
          description: "Your order has been placed successfully!",
        })
        router.push(`/orders/${responseData.internalOrderId}`)
        return
      }

      // Handle Razorpay payment
      const { orderId, internalOrderId } = responseData
      const options: RazorpayOptions = {
        key: razorpayKeyId!,
        amount: Math.round(total * 100),
        currency: "INR",
        name: "Memmoire",
        description: "Custom Print on Demand Order",
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          // Verify payment
          try {
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                internal_order_id: internalOrderId,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed")
            }

            const { order } = await verifyResponse.json()
            toast({
              title: "Payment Successful",
              description: "Your order has been placed!",
            })
            router.push(`/orders/${order.id}`)
          } catch (error) {
            console.error("Verification error:", error)
            toast({
              title: "Verification Failed",
              description: "Payment verification failed. Please contact support.",
              variant: "destructive",
            })
          }
        },
        prefill: {
          name: user.full_name || shippingAddress.full_name,
          email: user.email,
          contact: user.phone || shippingAddress.phone,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on("payment.failed", (response: { error: { description: string } }) => {
        toast({
          title: "Payment Failed",
          description: response.error.description || "Payment failed",
          variant: "destructive",
        })
        setIsProcessing(false)
      })
      razorpay.open()
    } catch (error) {
      console.error("Order error:", error)
      toast({
        title: "Order Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Shipping Address */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length > 0 && !showNewAddress ? (
                <div className="space-y-4">
                  <RadioGroup value={selectedAddressId || ""} onValueChange={setSelectedAddressId}>
                    {addresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-3 rounded-lg border p-4">
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                          <p className="font-medium">{address.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <Button variant="outline" onClick={() => setShowNewAddress(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={newAddress.full_name}
                        onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address1">Address Line 1 *</Label>
                      <Input
                        id="address1"
                        value={newAddress.address_line1}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address2">Address Line 2</Label>
                      <Input
                        id="address2"
                        value={newAddress.address_line2}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select
                        value={newAddress.state}
                        onValueChange={(value) => setNewAddress({ ...newAddress, state: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="postalCode">PIN Code *</Label>
                      <Input
                        id="postalCode"
                        value={newAddress.postal_code}
                        onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                        placeholder="400001"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  {addresses.length > 0 && (
                    <Button variant="ghost" onClick={() => setShowNewAddress(false)}>
                      Use existing address
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({cartItems.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                    <img
                      src={item.mockup_url || item.design_url || "/placeholder.svg"}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.color} / {item.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">₹{(item.unit_price * item.quantity).toFixed(0)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
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
                <span>₹{shipping}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>₹{tax}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>

              <div className="space-y-4 pt-4">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "razorpay" | "cod")}>
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer font-medium">
                      Online Payment (Razorpay)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer font-medium">
                      Cash on Delivery
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <Button
                size="lg"
                className="w-full"
                onClick={handlePlaceOrder}
                disabled={isProcessing || (paymentMethod === "razorpay" && !razorpayKeyId)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === "cod" ? (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Place Order (COD)
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay ₹{total.toFixed(0)}
                  </>
                )}
              </Button>

              {paymentMethod === "razorpay" && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secured by Razorpay</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
