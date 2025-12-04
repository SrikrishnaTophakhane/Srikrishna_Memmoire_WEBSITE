import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/products/product-detail"
import { getProductById, generateVariants } from "@/lib/products-data"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProductById(Number.parseInt(id, 10))

  if (product) {
    return {
      title: `${product.title} | Memmoire`,
      description: product.description,
    }
  }

  return {
    title: "Product | Memmoire",
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = getProductById(Number.parseInt(id, 10))

  if (!product) {
    notFound()
  }

  const variants = generateVariants(product)

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product} variants={variants} />
    </div>
  )
}
