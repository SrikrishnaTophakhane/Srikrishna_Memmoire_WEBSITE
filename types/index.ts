export interface User {
  id: string
  email: string
  phone?: string
  full_name?: string
  avatar_url?: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  is_default: boolean
}

export interface CartItem {
  id: string
  user_id: string
  printful_product_id: number
  printful_variant_id: number
  product_name: string
  variant_name: string
  color?: string
  size?: string
  design_url: string
  mockup_url?: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: "pending" | "paid" | "processing" | "fulfilled" | "shipped" | "delivered" | "cancelled"
  subtotal: number
  shipping_cost: number
  tax: number
  total_amount: number
  currency: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  printful_order_id?: string
  printful_status?: string
  tracking_url?: string
  shipping_address: Address
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  printful_product_id: number
  printful_variant_id: number
  product_name: string
  variant_name: string
  color?: string
  size?: string
  design_url: string
  mockup_url?: string
  quantity: number
  unit_price: number
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
  image: string
}

export interface Product {
  id: number
  title: string
  description: string
  type: string
  brand: string
  image: string
  variants: ProductVariant[]
  minPrice: number
  maxPrice: number
}

export interface ProductVariant {
  id: number
  name: string
  size: string
  color: string
  colorCode: string
  image: string
  price: number
  inStock: boolean
}
