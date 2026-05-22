export interface SellerDashboardStats {
  totalQuotes: number
  won: number
  pending: number
  winRate: number
  totalRevenue: number
}

export interface ChartQuotePoint {
  price: number
  updatedAt: string
}

export interface SellerTodayStats {
  won: number
  pending: number
  lost: number
  revenue: number
}

export interface SellerRecentSale {
  id: string
  price: number
  status: string
  request: {
    partName: string
    vehicleBrand: string
  }
}

export interface SellerDashboardData {
  stats: SellerDashboardStats
  todayStats: SellerTodayStats
  recentSales: Array<SellerRecentSale>
  chartQuotes: Array<ChartQuotePoint>
}

export interface OpenRequestRow {
  id: string
  partName: string
  oemNumber: string | null
  vehicleBrand: string
  modelYear: string
  imageUrls: Array<string> | null
  notes: string | null
  createdAt: string
  quotesCount: number
  isPriority: boolean
  category: { id: string; name: string; imageUrl: string | null } | null
  brand: { id: string; brand: string; imageUrl: string | null } | null
}

export interface SellerQuoteRequestRef {
  id: string
  partName: string
  vehicleBrand: string
  modelYear: string
  imageUrls: Array<string> | null
  status: string
}

export interface SellerQuoteCategoryRef {
  id: string
  name: string
}

export interface SellerQuote {
  id: string
  requestId: string
  sellerId: string
  price: number
  condition: 'new' | 'used'
  warranty: string | null
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
  request: SellerQuoteRequestRef
  category: SellerQuoteCategoryRef | null
}

export interface CreditTransaction {
  id: string
  type: string
  amount: number
  description: string | null
  createdAt: string
}

export interface CreditBalance {
  balance: number
  transactions: Array<CreditTransaction>
}

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  description: string | null
  isActive: boolean
}

export interface OpenRequestFilters {
  categoryId?: string
  brandIds?: Array<string>
  search?: string
  limit?: number
  offset?: number
}
