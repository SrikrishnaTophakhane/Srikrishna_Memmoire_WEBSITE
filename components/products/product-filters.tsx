"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shirt, Package, Coffee, HardHat } from "lucide-react"

const categories = [
  { slug: "t-shirts", name: "T-Shirts", icon: Shirt },
  { slug: "hoodies", name: "Hoodies", icon: Package },
  { slug: "mugs", name: "Mugs", icon: Coffee },
  { slug: "caps", name: "Caps & Hats", icon: HardHat },
]

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category")

  function handleCategoryClick(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set("category", slug)
    } else {
      params.delete("category")
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant={!currentCategory ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleCategoryClick(null)}
        >
          All Products
        </Button>
        {categories.map((category) => (
          <Button
            key={category.slug}
            variant={currentCategory === category.slug ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleCategoryClick(category.slug)}
          >
            <category.icon className="mr-2 h-4 w-4" />
            {category.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
