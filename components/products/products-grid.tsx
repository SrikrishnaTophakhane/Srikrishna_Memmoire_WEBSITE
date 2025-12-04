import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllProducts, getProductsByCategory, searchProducts, type Product } from "@/lib/products-data"

function getProducts(category?: string, search?: string): Product[] {
  if (search) {
    return searchProducts(search)
  }
  if (category) {
    return getProductsByCategory(category)
  }
  return getAllProducts()
}

export async function ProductsGrid({
  category,
  search,
}: {
  category?: string
  search?: string
}) {
  const products = getProducts(category, search)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg text-muted-foreground">No products found</p>
        <Link href="/products" className="mt-4 text-primary underline">
          View all products
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
            <CardContent className="p-0">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <Badge className="absolute left-3 top-3" variant="secondary">
                  {product.type}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{product.brand}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-semibold text-primary">From ₹{(product.basePrice / 100).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">{product.colors.length} colors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
