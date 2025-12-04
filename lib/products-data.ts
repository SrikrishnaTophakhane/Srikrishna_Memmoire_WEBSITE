export interface Product {
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
}

export interface ProductVariant {
  id: number
  productId: number
  name: string
  color: string
  size: string
  colorCode: string
  price: number
  inStock: boolean
}

export interface ProductCategory {
  id: number
  name: string
  printfulCategoryId: number
  products: Product[]
}

export const PRODUCT_CATEGORIES: Record<string, ProductCategory> = {
  "t-shirts": {
    id: 1,
    name: "T-Shirts",
    printfulCategoryId: 24,
    products: [
      {
        id: 71,
        title: "Unisex Staple T-Shirt | Bella + Canvas 3001",
        description:
          "This classic unisex jersey short sleeve tee fits like a well-loved favorite. Soft cotton and quality print make for a great staple piece.",
        type: "T-SHIRT",
        brand: "Bella + Canvas",
        image: "/white-unisex-t-shirt-product-photo.jpg",
        colorImages: {
          White: "/white-plain-t-shirt-front-view-product-photo.jpg",
          Black: "/black-plain-t-shirt-front-view-product-photo.jpg",
          Navy: "/navy-blue-plain-t-shirt-front-view-product-photo.jpg",
          Red: "/red-plain-t-shirt-front-view-product-photo.jpg",
          "Forest Green": "/forest-green-plain-t-shirt-front-view-product-phot.jpg",
          "Heather Grey": "/heather-grey-plain-t-shirt-front-view-product-phot.jpg",
        },
        basePrice: 799,
        colors: ["White", "Black", "Navy", "Red", "Forest Green", "Heather Grey"],
        sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
      },
      {
        id: 145,
        title: "Unisex Premium T-Shirt | Bella + Canvas 3001",
        description: "Premium quality t-shirt with a modern fit. Perfect for custom designs and everyday wear.",
        type: "T-SHIRT",
        brand: "Bella + Canvas",
        image: "/premium-black-t-shirt-product-photo.jpg",
        colorImages: {
          White: "/white-premium-t-shirt-front-view-product-photo.jpg",
          Black: "/black-premium-t-shirt-front-view-product-photo.jpg",
          Navy: "/navy-blue-premium-t-shirt-front-view-product-photo.jpg",
          Charcoal: "/charcoal-grey-premium-t-shirt-front-view-product-p.jpg",
          Maroon: "/maroon-premium-t-shirt-front-view-product-photo.jpg",
        },
        basePrice: 899,
        colors: ["White", "Black", "Navy", "Charcoal", "Maroon"],
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        id: 380,
        title: "Unisex Organic Cotton T-Shirt",
        description: "Eco-friendly organic cotton t-shirt. Sustainable fashion meets quality printing.",
        type: "T-SHIRT",
        brand: "Stanley/Stella",
        image: "/organic-cotton-t-shirt-eco-friendly.jpg",
        colorImages: {
          White: "/white-organic-cotton-t-shirt-front-view.jpg",
          Black: "/black-organic-cotton-t-shirt-front-view.jpg",
          "French Navy": "/french-navy-organic-cotton-t-shirt-front-view.jpg",
          "Desert Dust": "/desert-dust-beige-organic-cotton-t-shirt-front-vie.jpg",
        },
        basePrice: 1099,
        colors: ["White", "Black", "French Navy", "Desert Dust"],
        sizes: ["XS", "S", "M", "L", "XL", "2XL"],
      },
    ],
  },
  hoodies: {
    id: 2,
    name: "Hoodies",
    printfulCategoryId: 55,
    products: [
      {
        id: 146,
        title: "Unisex Heavy Blend Hoodie | Gildan 18500",
        description:
          "A cozy blend of cotton and polyester that keeps you warm and looks great with your custom design.",
        type: "HOODIE",
        brand: "Gildan",
        image: "/black-hoodie-sweatshirt-product-photo.jpg",
        colorImages: {
          White: "/white-heavy-blend-hoodie-front-view.jpg",
          Black: "/black-heavy-blend-hoodie-front-view.jpg",
          Navy: "/navy-heavy-blend-hoodie-front-view.jpg",
          "Sport Grey": "/sport-grey-heavy-blend-hoodie-front-view.jpg",
          Maroon: "/maroon-heavy-blend-hoodie-front-view.jpg",
          "Forest Green": "/forest-green-heavy-blend-hoodie-front-view.jpg",
        },
        basePrice: 1999,
        colors: ["White", "Black", "Navy", "Sport Grey", "Maroon", "Forest Green"],
        sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
      },
      {
        id: 293,
        title: "Premium Pullover Hoodie | Bella + Canvas 3719",
        description: "Ultra-soft fleece hoodie with a modern fit. Perfect for custom artwork.",
        type: "HOODIE",
        brand: "Bella + Canvas",
        image: "/grey-premium-pullover-hoodie.jpg",
        colorImages: {
          White: "/white-premium-pullover-hoodie-front-view.jpg",
          Black: "/black-premium-pullover-hoodie-front-view.jpg",
          "Heather Grey": "/heather-grey-premium-pullover-hoodie-front-view.jpg",
          Navy: "/navy-premium-pullover-hoodie-front-view.jpg",
        },
        basePrice: 2499,
        colors: ["White", "Black", "Heather Grey", "Navy"],
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
      {
        id: 381,
        title: "Zip-Up Hoodie | Independent Trading",
        description: "Classic zip-up hoodie with front pockets. Great for layering.",
        type: "HOODIE",
        brand: "Independent Trading",
        image: "/zip-up-hoodie-navy-blue.jpg",
        colorImages: {
          Black: "/black-zip-up-hoodie-front-view.jpg",
          Navy: "/navy-zip-up-hoodie-front-view.jpg",
          Charcoal: "/charcoal-zip-up-hoodie-front-view.jpg",
          "Heather Grey": "/heather-grey-zip-up-hoodie-front-view.jpg",
        },
        basePrice: 2299,
        colors: ["Black", "Navy", "Charcoal", "Heather Grey"],
        sizes: ["S", "M", "L", "XL", "2XL"],
      },
    ],
  },
  mugs: {
    id: 3,
    name: "Mugs",
    printfulCategoryId: 21,
    products: [
      {
        id: 19,
        title: "White Glossy Mug 11oz",
        description: "Classic ceramic mug with a glossy finish. Dishwasher and microwave safe.",
        type: "MUG",
        brand: "Generic",
        image: "/white-ceramic-coffee-mug.jpg",
        colorImages: {
          White: "/white-glossy-mug-11oz-front-view.jpg",
        },
        basePrice: 599,
        colors: ["White"],
        sizes: ["11oz"],
      },
      {
        id: 218,
        title: "White Glossy Mug 15oz",
        description: "Larger ceramic mug for those who need more coffee. Vibrant print quality.",
        type: "MUG",
        brand: "Generic",
        image: "/large-white-ceramic-mug-15oz.jpg",
        colorImages: {
          White: "/white-glossy-mug-15oz-front-view.jpg",
        },
        basePrice: 699,
        colors: ["White"],
        sizes: ["15oz"],
      },
      {
        id: 383,
        title: "Black Mug 11oz",
        description: "Sleek black ceramic mug. Stand out with your design on a dark background.",
        type: "MUG",
        brand: "Generic",
        image: "/black-ceramic-coffee-mug.jpg",
        colorImages: {
          Black: "/black-glossy-mug-11oz-front-view.jpg",
        },
        basePrice: 699,
        colors: ["Black"],
        sizes: ["11oz"],
      },
    ],
  },
  caps: {
    id: 4,
    name: "Caps & Hats",
    printfulCategoryId: 59,
    products: [
      {
        id: 206,
        title: "Dad Hat | Yupoong 6245CM",
        description: "Classic low-profile dad hat with adjustable strap. Embroidered design.",
        type: "HAT",
        brand: "Yupoong",
        image: "/dad-hat-baseball-cap-khaki.jpg",
        colorImages: {
          White: "/placeholder.svg?height=600&width=600",
          Black: "/placeholder.svg?height=600&width=600",
          Navy: "/placeholder.svg?height=600&width=600",
          Khaki: "/placeholder.svg?height=600&width=600",
          Red: "/placeholder.svg?height=600&width=600",
        },
        basePrice: 1299,
        colors: ["White", "Black", "Navy", "Khaki", "Red"],
        sizes: ["One Size"],
      },
      {
        id: 376,
        title: "Snapback Hat | Yupoong 6089M",
        description: "Flat bill snapback with structured crown. Bold embroidery options.",
        type: "HAT",
        brand: "Yupoong",
        image: "/snapback-hat-flat-bill-black.jpg",
        colorImages: {
          Black: "/placeholder.svg?height=600&width=600",
          Navy: "/placeholder.svg?height=600&width=600",
          Red: "/placeholder.svg?height=600&width=600",
          Grey: "/placeholder.svg?height=600&width=600",
        },
        basePrice: 1499,
        colors: ["Black", "Navy", "Red", "Grey"],
        sizes: ["One Size"],
      },
      {
        id: 439,
        title: "Trucker Cap | Richardson 112",
        description: "Classic trucker style with mesh back. Breathable and stylish.",
        type: "HAT",
        brand: "Richardson",
        image: "/trucker-cap-mesh-back.jpg",
        colorImages: {
          "Black/White": "/placeholder.svg?height=600&width=600",
          "Navy/White": "/placeholder.svg?height=600&width=600",
          "Charcoal/White": "/placeholder.svg?height=600&width=600",
        },
        basePrice: 1399,
        colors: ["Black/White", "Navy/White", "Charcoal/White"],
        sizes: ["One Size"],
      },
    ],
  },
}

export function getAllProducts(): Product[] {
  return Object.values(PRODUCT_CATEGORIES).flatMap((cat) => cat.products)
}

export function getProductsByCategory(category: string): Product[] {
  const categoryKey = category.toLowerCase().replace(/[^a-z-]/g, "")
  const catData = Object.entries(PRODUCT_CATEGORIES).find(
    ([key]) => key === categoryKey || key.includes(categoryKey.replace("-", "")),
  )
  return catData ? catData[1].products : []
}

export function getProductById(id: number): (Product & { category: string }) | null {
  for (const cat of Object.values(PRODUCT_CATEGORIES)) {
    const product = cat.products.find((p) => p.id === id)
    if (product) {
      return { ...product, category: cat.name }
    }
  }
  return null
}

export function searchProducts(query: string): Product[] {
  const searchLower = query.toLowerCase()
  const results: Product[] = []

  for (const cat of Object.values(PRODUCT_CATEGORIES)) {
    const matching = cat.products.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.type.toLowerCase().includes(searchLower),
    )
    results.push(...matching)
  }

  return results
}

export function getCategories() {
  return Object.entries(PRODUCT_CATEGORIES).map(([key, value]) => ({
    slug: key,
    name: value.name,
    productCount: value.products.length,
  }))
}

export function generateVariants(product: Product): ProductVariant[] {
  const variants: ProductVariant[] = []
  let variantId = product.id * 1000

  for (const color of product.colors) {
    for (const size of product.sizes) {
      variants.push({
        id: variantId++,
        productId: product.id,
        name: `${color} / ${size}`,
        color,
        size,
        colorCode: getColorCode(color),
        price: product.basePrice,
        inStock: true,
      })
    }
  }

  return variants
}

export function getColorCode(color: string): string {
  const colorMap: Record<string, string> = {
    White: "#FFFFFF",
    Black: "#000000",
    Navy: "#1a365d",
    Red: "#dc2626",
    "Forest Green": "#228B22",
    "Heather Grey": "#9ca3af",
    Grey: "#6b7280",
    Charcoal: "#374151",
    Maroon: "#7f1d1d",
    Khaki: "#c4b097",
    "Sport Grey": "#6b7280",
    "French Navy": "#1e3a5f",
    "Desert Dust": "#d4c4b0",
    "Black/White": "#000000",
    "Navy/White": "#1a365d",
    "Charcoal/White": "#374151",
  }
  return colorMap[color] || "#000000"
}
