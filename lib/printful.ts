const PRINTFUL_API_URL = "https://api.printful.com"

interface PrintfulRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
}

export async function printfulRequest<T>(endpoint: string, options: PrintfulRequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options

  const response = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.result || "Printful API error")
  }

  const data = await response.json()
  return data.result
}

export interface PrintfulProduct {
  id: number
  type: string
  type_name: string
  title: string
  brand: string
  model: string
  image: string
  variant_count: number
  currency: string
  files: PrintfulFileType[]
  options: PrintfulOption[]
  is_discontinued: boolean
  description: string
}

export interface PrintfulVariant {
  id: number
  product_id: number
  name: string
  size: string
  color: string
  color_code: string
  color_code2: string | null
  image: string
  price: string
  in_stock: boolean
  availability_status: string
}

export interface PrintfulFileType {
  id: string
  type: string
  title: string
  additional_price: string
}

export interface PrintfulOption {
  id: string
  title: string
  type: string
  values: Record<string, string>
}

export interface PrintfulCategory {
  id: number
  parent_id: number
  image_url: string
  size: string
  title: string
}

// Get all product categories
export async function getCategories(): Promise<PrintfulCategory[]> {
  return printfulRequest<PrintfulCategory[]>("/categories")
}

// Get products by category
export async function getProductsByCategory(categoryId?: number): Promise<PrintfulProduct[]> {
  const endpoint = categoryId ? `/products?category_id=${categoryId}` : "/products"
  return printfulRequest<PrintfulProduct[]>(endpoint)
}

// Get single product with variants
export async function getProduct(
  productId: number,
): Promise<{ product: PrintfulProduct; variants: PrintfulVariant[] }> {
  return printfulRequest<{ product: PrintfulProduct; variants: PrintfulVariant[] }>(`/products/${productId}`)
}

// Get variant details
export async function getVariant(variantId: number): Promise<PrintfulVariant> {
  const data = await printfulRequest<{ variant: PrintfulVariant }>(`/products/variant/${variantId}`)
  return data.variant
}

// Create mockup generation task
export async function createMockupTask(
  productId: number,
  variantIds: number[],
  files: { placement: string; image_url: string }[],
): Promise<{ task_key: string; status: string }> {
  return printfulRequest<{ task_key: string; status: string }>("/mockup-generator/create-task/" + productId, {
    method: "POST",
    body: {
      variant_ids: variantIds,
      files,
    },
  })
}

// Get mockup task result
export async function getMockupTaskResult(taskKey: string): Promise<{
  status: string
  mockups: { placement: string; variant_ids: number[]; mockup_url: string }[]
  error?: string
}> {
  return printfulRequest<{
    status: string
    mockups: { placement: string; variant_ids: number[]; mockup_url: string }[]
    error?: string
  }>(`/mockup-generator/task?task_key=${taskKey}`)
}

// Get printfiles for product
export async function getPrintfiles(productId: number): Promise<{
  product_id: number
  available_placements: Record<string, { title: string; conflicting_placements: string[] }>
  printfiles: {
    printfile_id: number
    width: number
    height: number
    dpi: number
    fill_mode: string
    can_rotate: boolean
  }[]
  variant_printfiles: { variant_id: number; placements: Record<string, number> }[]
}> {
  return printfulRequest<{
    product_id: number
    available_placements: Record<string, { title: string; conflicting_placements: string[] }>
    printfiles: {
      printfile_id: number
      width: number
      height: number
      dpi: number
      fill_mode: string
      can_rotate: boolean
    }[]
    variant_printfiles: { variant_id: number; placements: Record<string, number> }[]
  }>(`/mockup-generator/printfiles/${productId}`)
}

// Calculate shipping rates
export async function calculateShipping(
  recipient: {
    address1: string
    city: string
    country_code: string
    state_code?: string
    zip: string
  },
  items: { variant_id: number; quantity: number }[],
): Promise<
  { id: string; name: string; rate: string; currency: string; minDeliveryDays: number; maxDeliveryDays: number }[]
> {
  return printfulRequest<
    { id: string; name: string; rate: string; currency: string; minDeliveryDays: number; maxDeliveryDays: number }[]
  >("/shipping/rates", {
    method: "POST",
    body: { recipient, items },
  })
}

// Create order in Printful
export async function createPrintfulOrder(orderData: {
  recipient: {
    name: string
    address1: string
    address2?: string
    city: string
    state_code?: string
    country_code: string
    zip: string
    phone?: string
    email: string
  }
  items: {
    variant_id: number
    quantity: number
    files: { url: string; type: string }[]
  }[]
}): Promise<{ id: number; status: string }> {
  return printfulRequest<{ id: number; status: string }>("/orders", {
    method: "POST",
    body: orderData,
  })
}

// Get order status from Printful
export async function getPrintfulOrder(orderId: string): Promise<{
  id: number
  status: string
  shipping: string
  shipments: { carrier: string; service: string; tracking_number: string; tracking_url: string }[]
}> {
  return printfulRequest<{
    id: number
    status: string
    shipping: string
    shipments: { carrier: string; service: string; tracking_number: string; tracking_url: string }[]
  }>(`/orders/${orderId}`)
}
