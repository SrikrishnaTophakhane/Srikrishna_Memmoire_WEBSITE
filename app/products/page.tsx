import { Suspense } from "react"
import { ProductsGrid } from "@/components/products/products-grid"
import { ProductFilters } from "@/components/products/product-filters"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Products | Memmoire",
  description: "Browse our catalog of customizable products",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const params = await searchParams

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {params.category ? `${params.category.charAt(0).toUpperCase() + params.category.slice(1)}` : "All Products"}
        </h1>
        <p className="mt-2 text-muted-foreground">Choose a product and add your custom design</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-64 shrink-0">
          <ProductFilters />
        </aside>

        <div className="flex-1">
          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid category={params.category} search={params.search} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function ProductsGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
