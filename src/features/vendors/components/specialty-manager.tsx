import { useState, useEffect, useMemo } from 'react'
import { useSellerSpecialties, useUpdateSellerSpecialties } from '../hooks/use-vendors'
import { useQuery } from '@tanstack/react-query'
import { getPublicTaxonomyServerFn } from '@/fn/requests'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SpecialtyManager() {
  const { data: currentSpecialties, isLoading: loadingCurrent } = useSellerSpecialties()
  const updateSpecialties = useUpdateSellerSpecialties()
  
  const { data: taxonomy, isLoading: loadingTaxonomy } = useQuery({
    queryKey: ['taxonomy'],
    queryFn: () => getPublicTaxonomyServerFn(),
  })
  
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  useEffect(() => {
    if (currentSpecialties) {
      setSelectedBrands(currentSpecialties.brands || [])
      setSelectedCategories(currentSpecialties.categories || [])
    }
  }, [currentSpecialties])

  const isDirty = useMemo(() => {
    if (!currentSpecialties) return false
    
    const initialBrands = currentSpecialties.brands || []
    const initialCategories = currentSpecialties.categories || []
    
    if (selectedBrands.length !== initialBrands.length) return true
    if (selectedCategories.length !== initialCategories.length) return true
    
    const brandsMatch = selectedBrands.every(id => initialBrands.includes(id))
    const categoriesMatch = selectedCategories.every(id => initialCategories.includes(id))
    
    return !brandsMatch || !categoriesMatch
  }, [selectedBrands, selectedCategories, currentSpecialties])
  
  const toggleBrand = (id: string) => {
    setSelectedBrands(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }
  
  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }
  
  const handleSave = () => {
    updateSpecialties.mutate({
      brandIds: selectedBrands,
      categoryIds: selectedCategories,
    })
  }

  if (loadingCurrent || loadingTaxonomy) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const brands = taxonomy?.data?.brands || []
  const categories = taxonomy?.data?.categories || []

  return (
    <Card className="border shadow-sm overflow-hidden bg-card">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-bold tracking-tight">Marketplace Specialties</CardTitle>
        <CardDescription>
          Select the car brands and parts categories you specialize in to filter your marketplace feed.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Vehicle Brands</h3>
            <Badge variant="outline" className="rounded-full">
              {selectedBrands.length} Selected
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand: any) => {
              const isSelected = selectedBrands.includes(brand.id)
              return (
                <button
                  key={brand.id}
                  onClick={() => toggleBrand(brand.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border-2",
                    isSelected 
                      ? "bg-primary border-primary text-primary-foreground shadow-md scale-105" 
                      : "bg-card border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {brand.brand}
                  {isSelected ? <Check className="size-3" /> : <Plus className="size-3 opacity-40" />}
                </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Part Categories</h3>
            <Badge variant="outline" className="rounded-full">
              {selectedCategories.length} Selected
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: any) => {
              const isSelected = selectedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border-2",
                    isSelected 
                      ? "bg-primary border-primary text-primary-foreground shadow-md scale-105" 
                      : "bg-card border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {cat.name}
                  {isSelected ? <Check className="size-3" /> : <Plus className="size-3 opacity-40" />}
                </button>
              )
            })}
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={updateSpecialties.isPending || !isDirty}
            className="rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {updateSpecialties.isPending && <Loader2 className="me-2 size-4 animate-spin" />}
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
