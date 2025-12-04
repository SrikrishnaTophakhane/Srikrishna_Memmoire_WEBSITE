import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Package, Truck, Shield, Palette } from "lucide-react"

const categories = [
  {
    name: "T-Shirts",
    slug: "t-shirts",
    image: "/custom-printed-t-shirt-mockup.jpg",
    description: "Premium cotton tees",
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    image: "/custom-printed-hoodie-mockup.jpg",
    description: "Cozy & comfortable",
  },
  {
    name: "Mugs",
    slug: "mugs",
    image: "/custom-printed-ceramic-mug-mockup.jpg",
    description: "11oz ceramic mugs",
  },
  {
    name: "Caps",
    slug: "caps",
    image: "/custom-embroidered-cap-mockup.jpg",
    description: "Adjustable fit caps",
  },
]

const features = [
  {
    icon: Palette,
    title: "Easy Design Upload",
    description: "Upload your artwork and see instant mockups on real products",
  },
  {
    icon: Package,
    title: "No Inventory",
    description: "We print and ship directly to your customers on demand",
  },
  {
    icon: Truck,
    title: "Worldwide Shipping",
    description: "Fast delivery to over 190 countries with tracking",
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Premium printing and materials with satisfaction guarantee",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Create Custom Products with <span className="text-primary">Your Designs</span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
              Upload your artwork, choose from 100+ products, and sell worldwide. No inventory, no upfront costs. Print
              on demand made simple.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/products">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--color-primary)/0.1,transparent)]" />
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Popular Categories</h2>
            <p className="mt-4 text-muted-foreground">Choose from our most popular product categories</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`}>
                <Card className="group overflow-hidden transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mt-4 text-muted-foreground">Create custom products in three simple steps</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">Choose a Product</h3>
              <p className="mt-2 text-muted-foreground">Browse our catalog of t-shirts, hoodies, mugs, caps and more</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">Upload Your Design</h3>
              <p className="mt-2 text-muted-foreground">
                Add your artwork and preview it on a realistic product mockup
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">Order & Ship</h3>
              <p className="mt-2 text-muted-foreground">We print and ship your custom product directly to you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Create Something Amazing?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Join thousands of creators who are designing and selling custom products worldwide.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/auth/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
