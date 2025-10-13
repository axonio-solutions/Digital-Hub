"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ShoppingCart, Star, Check, Truck, Shield, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createFileRoute, useNavigate } from "@tanstack/react-router"


import { products } from "./products"
export const Route = createFileRoute('/_digital-hub/products/$id')({
  component: RouteComponent,
})

function RouteComponent() { 
      const navigate = useNavigate()

    const { id } = Route.useParams()
  const product = products.find(p => p.id === Number(id)) 

  
  

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={()=>{navigate({
      to: '/digital-hub/products',
    })}}  className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
            <h1 className="text-xl font-bold">ShopHub</h1>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">3</Badge>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary border border-border">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              {product.badge && (
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-sm px-3 py-1">
                  {product.badge}
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-bold mb-4 text-balance">{product.name}</h1>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating!) ? "fill-yellow-500 text-yellow-500" : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              )}

              <p className="text-5xl font-bold mb-6">${product.price}</p>

              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                {product.fullDescription || product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-medium">In Stock</span>
                </>
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Buy Button */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1 gap-2 text-lg py-6" disabled={!product.inStock}>
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="text-lg py-6 bg-transparent">
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Truck className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">Free Shipping</span>
                    <span className="text-xs text-muted-foreground">On orders over $50</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">2 Year Warranty</span>
                    <span className="text-xs text-muted-foreground">Full coverage</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">30-Day Returns</span>
                    <span className="text-xs text-muted-foreground">No questions asked</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 space-y-8"
        >
          {/* Features */}
          {product.features && product.features.length > 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Specifications</h2>
                <div className="space-y-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index}>
                      <div className="flex justify-between py-3">
                        <span className="font-medium">{spec.label}</span>
                        <span className="text-muted-foreground">{spec.value}</span>
                      </div>
                      {index < product.specifications!.length - 1 && <Separator className="bg-border" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>

  )
}
