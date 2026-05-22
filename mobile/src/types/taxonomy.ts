export interface TaxCategory {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
  requestsCount?: number
}

export interface TaxBrand {
  id: string
  brand: string
  imageUrl: string | null
  clusterOrigin: string
  clusterRegion: string
  status: string
  createdAt: string
  updatedAt: string
  requestsCount?: number
}

export interface PublicTaxonomyResult {
  categories: Array<TaxCategory>
  brands: Array<TaxBrand>
}
