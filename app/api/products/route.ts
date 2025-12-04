import { type NextRequest, NextResponse } from "next/server"
import {
  PRODUCT_CATEGORIES,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getCategories,
  generateVariants,
} from "@/lib/products-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const productId = searchParams.get("id")
  const search = searchParams.get("search")

  try {
    // Get single product
    if (productId) {
      const product = getProductById(Number.parseInt(productId))
      if (product) {
        const variants = generateVariants(product)
        return NextResponse.json({ product, variants })
      }
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get products by category
    if (category) {
      const products = getProductsByCategory(category)
      const catData = Object.entries(PRODUCT_CATEGORIES).find(
        ([key]) => key === category.toLowerCase() || key.includes(category.toLowerCase()),
      )
      return NextResponse.json({
        category: catData ? catData[1].name : category,
        products,
      })
    }

    // Search products
    if (search) {
      const results = searchProducts(search)
      return NextResponse.json({ products: results })
    }

    // Return all categories and products
    const categories = getCategories()
    const allProducts = getAllProducts()

    return NextResponse.json({ categories, products: allProducts })
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
