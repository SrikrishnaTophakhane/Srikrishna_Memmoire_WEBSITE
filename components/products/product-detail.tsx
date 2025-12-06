"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { DesignUploader } from "@/components/design/design-uploader"
import { ProductMockupPreview } from "@/components/products/product-mockup-preview"
import { Loader2, ShoppingCart, ChevronLeft, Check } from "lucide-react"
import Link from "next/link"

interface Variant {
  id: number
  productId: number
  name: string
  color: string
  size: string
  colorCode: string
  price: number
  inStock: boolean
}

interface Product {
  id: number
  title: string
  description: string
  type: string
  brand: string
  image: string
  colorImages: Record<string, string>
  basePrice: number
  colors: string[]
  sizes: string[]
  category: string
}

interface ProductDetailProps {
  product: Product
  variants: Variant[]
}

export function ProductDetail({ product, variants }: ProductDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [designUrl, setDesignUrl] = useState<string | null>(null)
  const [mockupUrl, setMockupUrl] = useState<string | null>(null)
  const [designPosition, setDesignPosition] = useState({ x: 0, y: 0, scale: 100 })
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const selectedVariant = variants.find((v) => v.color === selectedColor && v.size === selectedSize)

  const uniqueColors = [...new Set(product.colors)]
  const availableSizes = variants.filter((v) => v.color === selectedColor && v.inStock).map((v) => v.size)

  const currentProductImage = product.colorImages?.[selectedColor] || product.image

  async function handleAddToCart() {
    if (!user) {
      router.push(`/auth/login?redirect=/products/${product.id}`)
      return
    }

    if (!selectedVariant) {
      toast({
        title: "Selection required",
        description: "Please select a size and color",
        variant: "destructive",
      })
      return
    }

    setIsAddingToCart(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        printful_product_id: product.id,
        printful_variant_id: selectedVariant.id,
        product_name: product.title,
        variant_name: selectedVariant.name,
        color: selectedColor,
        size: selectedSize,
        design_url: designUrl || null,
        mockup_url: mockupUrl || null,
        quantity: 1,
        unit_price: selectedVariant.price / 100,
        design_config: designUrl ? designPosition : null,
      })

      if (error) throw error

      toast({
        title: "Added to cart!",
        description: `${product.title} has been added to your cart`,
      })
      router.refresh()
    } catch (error) {
      console.error("Add to cart error:", error)
      // Log specific database error if available
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error("Detailed error message:", (error as any).message)
        if ("details" in error) console.error("Error details:", (error as any).details)
        if ("hint" in error) console.error("Error hint:", (error as any).hint)
        if ("code" in error) console.error("Error code:", (error as any).code)
      }

      toast({
        title: "Error",
        description: "Failed to add to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  function handleDesignUploaded(url: string, mockup?: string) {
    setDesignUrl(url)
    if (mockup) setMockupUrl(mockup)
  }

  function handleDesignPositionChange(position: { x: number; y: number; scale: number }) {
    setDesignPosition(position)
  }

  return (
    <div>
      <Link
        href="/products"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image with Live Mockup Preview */}
        <div className="space-y-4">
          <ProductMockupPreview
            productImage={currentProductImage}
            designImage={designUrl}
            productType={product.type}
            color={selectedColor}
            onDesignPositionChange={handleDesignPositionChange}
          />

          {/* Design Thumbnail Preview */}
          {designUrl && (
            <Card>
              <CardContent className="p-4">
                <p className="mb-2 text-sm font-medium">Your Design</p>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded border bg-muted">
                    <img
                      src={designUrl || "/placeholder.svg"}
                      alt="Uploaded design"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Offset: {Math.round(designPosition.x)}%, {Math.round(designPosition.y)}%
                    </p>
                    <p>Scale: {designPosition.scale}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="mt-2 text-muted-foreground">{product.brand}</p>
          </div>

          <div>
            <p className="text-3xl font-bold text-primary">
              ₹{selectedVariant ? (selectedVariant.price / 100).toFixed(0) : (product.basePrice / 100).toFixed(0)}
            </p>
            <p className="text-sm text-muted-foreground">+ shipping</p>
          </div>

          <Separator />

          <p className="text-muted-foreground">{product.description}</p>

          <Separator />

          <div>
            <Label className="text-base font-medium">
              Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
            </Label>
            <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="mt-3 flex flex-wrap gap-2">
              {uniqueColors.map((color) => {
                const colorVariant = variants.find((v) => v.color === color)
                const isSelected = selectedColor === color
                return (
                  <div key={color} className="relative">
                    <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
                    <Label
                      htmlFor={`color-${color}`}
                      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-muted hover:border-muted-foreground/50"
                      }`}
                      style={{ backgroundColor: colorVariant?.colorCode || "#000" }}
                    >
                      {isSelected && (
                        <Check
                          className={`h-5 w-5 ${
                            ["White", "Heather Grey", "Sport Grey", "Khaki", "Desert Dust"].includes(color)
                              ? "text-foreground"
                              : "text-white"
                          }`}
                        />
                      )}
                      <span className="sr-only">{color}</span>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Size Selection */}
          <div>
            <Label className="text-base font-medium">Size</Label>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {product.sizes.map((size) => (
                  <SelectItem key={size} value={size} disabled={!availableSizes.includes(size)}>
                    {size}
                    {!availableSizes.includes(size) && " (Out of stock)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Design Upload */}
          <div>
            <Label className="text-base font-medium">Upload Your Design</Label>
            <p className="mb-3 text-sm text-muted-foreground">
              Upload a PNG or JPG image. Transparent backgrounds work best.
            </p>
            <DesignUploader productId={product.id} onDesignUploaded={handleDesignUploaded} />
          </div>

          <Separator />

          {/* Add to Cart */}
          <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isAddingToCart}>
            {isAddingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding to Cart...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart - ₹
                {selectedVariant ? (selectedVariant.price / 100).toFixed(0) : (product.basePrice / 100).toFixed(0)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
