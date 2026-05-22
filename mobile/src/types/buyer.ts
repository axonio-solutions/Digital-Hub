export interface BuyerBrand {
  id: string
  brand: string
  clusterOrigin: string
  clusterRegion: string
  imageUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface BuyerCategory {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface QuoteSeller {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string | null
  storeName: string | null
  phoneNumber: string | null
  whatsappNumber: string | null
  wilaya: string | null
  city: string | null
  address: string | null
}

export interface Quote {
  id: string
  requestId: string
  sellerId: string
  price: number
  condition: 'new' | 'used'
  warranty: string | null
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
  seller: QuoteSeller
}

export interface BuyerRequestRow {
  id: string
  buyerId: string
  categoryId: string | null
  brandId: string | null
  partName: string
  oemNumber: string | null
  vehicleBrand: string
  modelYear: string
  imageUrls: Array<string> | null
  status: 'open' | 'fulfilled' | 'cancelled'
  notes: string | null
  isSpam: boolean
  isPriority: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  category: BuyerCategory | null
  brand: BuyerBrand | null
  quotes: Array<Quote>
}

export interface BuyerDashboardMetrics {
  activeRequests: number
  totalQuotes: number
  fulfilledRequests: number
}
