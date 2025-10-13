"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Grid3x3, List, ShoppingCart, Menu, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { products } from "@/routes/_digital-hub/products/products"
import { Link } from "@tanstack/react-router"

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

 

  // Get unique categories
  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(products.map((p) => p.category)))]
  }, [products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

      let matchesPrice = true
      if (priceFilter === "under-100") matchesPrice = product.price < 100
      else if (priceFilter === "100-200") matchesPrice = product.price >= 100 && product.price < 200
      else if (priceFilter === "over-200") matchesPrice = product.price >= 200

      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [products, searchQuery, categoryFilter, priceFilter])

 

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-balance">ShopHub</h1>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Products
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Deals
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
              </nav>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-9 bg-secondary border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Cart & Mobile Menu */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9 bg-secondary border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="flex flex-col gap-2 py-4">
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    Products
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    Categories
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    Deals
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    About
                  </a>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Filters & View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-100">Under $100</SelectItem>
                <SelectItem value="100-200">$100 - $200</SelectItem>
                <SelectItem value="over-200">Over $200</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        {/* Products Grid/List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={
              viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"
            }
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {viewMode === "grid" ? (
                  <Link to={`/digital-hub/products/$id`}  params={{ id: product.id }} className="block h-full">
                    <Card className="h-full flex flex-col bg-card border-border hover:border-ring transition-colors cursor-pointer">
                      <CardHeader className="p-0">
                        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-secondary">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                          />
                          {product.badge && (
                            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 p-6">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-lg text-balance">{product.name}</CardTitle>
                          <Badge variant="secondary" className="shrink-0">
                            {product.category}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm text-muted-foreground text-pretty">
                          {product.description}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-6 pt-0 flex items-center justify-between">
                        <span className="text-2xl font-bold">${product.price}</span>
                        <Button className="gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Buy Now
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ) : (
                  <Link to={`/digital-hub/products/$id`}  params={{ id: product.id }} className="block">
                    <Card className="bg-card border-border hover:border-ring transition-colors cursor-pointer">
                      <div className="flex flex-col sm:flex-row gap-6 p-6">
                        <div className="relative w-20 sm:w-24 h-20 sm:h-24 overflow-hidden rounded-lg bg-secondary shrink-0">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                          />
                          {product.badge && (
                            <Badge className="absolute top-1 right-1 text-xs bg-primary text-primary-foreground">
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <CardTitle className="text-xl text-balance">{product.name}</CardTitle>
                              <Badge variant="secondary">{product.category}</Badge>
                            </div>
                            <CardDescription className="text-muted-foreground text-pretty">
                              {product.description}
                            </CardDescription>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold">${product.price}</span>
                            <Button size="lg" className="gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              Buy Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("all")
                setPriceFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">ShopHub</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Your one-stop shop for quality products at great prices.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    All Products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Best Sellers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Sale
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-border" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 ShopHub. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
