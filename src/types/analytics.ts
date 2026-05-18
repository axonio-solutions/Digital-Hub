export interface DistributionItem {
  wilaya: string
  count: number
}

export interface VolumeItem {
  date: string
  count: number
}

export interface LabeledCount {
  label: string
  count: number
}

export interface BuyerMetrics {
  totalBuyers: number
  totalRequests: number
  avgOffersPerRequest: number
  conversionRate: string
  avgResponseTime: string
}

export interface SellerMetrics {
  totalSellers: number
  totalQuotes: number
  acceptedQuotes: number
  conversionRate: string
  avgResponseTime: string
  avgQuotesPerRequest: number
}

export interface BuyerAnalyticsData {
  metrics: BuyerMetrics
  distribution: DistributionItem[]
  demandByOrigin: LabeledCount[]
  requestVolume: VolumeItem[]
}

export interface SellerAnalyticsData {
  metrics: SellerMetrics
  distribution: DistributionItem[]
  demandByCategory: LabeledCount[]
  requestVolume: VolumeItem[]
}
