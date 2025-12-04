import Link from "next/link"
import { Palette } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Memmoire</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Create custom products with your unique designs. High-quality print on demand with worldwide shipping.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Products</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products?category=t-shirts" className="hover:text-foreground">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/products?category=hoodies" className="hover:text-foreground">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link href="/products?category=mugs" className="hover:text-foreground">
                  Mugs
                </Link>
              </li>
              <li>
                <Link href="/products?category=caps" className="hover:text-foreground">
                  Caps
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-foreground">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Memmoire. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
