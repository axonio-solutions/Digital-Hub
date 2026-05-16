import { fetchGlobalMetrics } from '@/data-access/admin'
import { fetchAllUsers, fetchUserDetailsQuery, toggleUserBan } from '@/data-access/users'
import {
  fetchAdvancedSystemMetrics,
  fetchAdminDashboardStats,
  fetchBuyerMetrics,
  fetchDemandByCategory,
  fetchDemandByOrigin,
  fetchMarketHealth,
  fetchMerchantSegmentation,
  fetchRegionalDemand,
  fetchRequestVolume,
  fetchQuoteVolume,
  fetchSellerCategoryFocus,
  fetchSellerMetrics,
  fetchTopBuyers,
  fetchUserDistributionByWilaya,
  fetchCategoryGapAnalysis,
  fetchBrandGapAnalysis,
  fetchRegionalGapAnalysis,
  fetchUnservedRequests,
  fetchFulfillmentRate,
} from '@/data-access/analytics'
import {
  getPartCategories,
  getVehicleBrands,
  createPartCategory,
  updatePartCategory,
  deletePartCategory,
  createVehicleBrand,
  updateVehicleBrand,
  deleteVehicleBrand
} from '@/data-access/taxonomy'
import { CategoryInput, BrandInput } from '@/features/taxonomy/validations/taxonomy'

/**
 * Axis Layer 4: Use Cases for Admin
 */

const analyticsCache: Record<string, { data: any; timestamp: number }> = {}
const ANALYTICS_CACHE_TTL = 5 * 60 * 1000

async function getCachedAnalytics(key: string, fetcher: () => Promise<any>) {
  const now = Date.now()
  const cached = analyticsCache[key]
  if (cached && now - cached.timestamp < ANALYTICS_CACHE_TTL) {
    return cached.data
  }
  const data = await fetcher()
  analyticsCache[key] = { data, timestamp: now }
  return data
}

export async function getAdminMetricsUseCase() {
  return await fetchGlobalMetrics()
}

export async function getAllUsersUseCase() {
  try {
    const [users, marketData] = await Promise.all([
      fetchAllUsers(),
      import('@/data-access/vendors').then(m => m.getMarketPriorityMap())
    ])

    const { calculatePriorityScore } = await import('@/data-access/vendors')

    return users.map(user => ({
      ...user,
      priorityScore: user.role === 'seller' 
        ? calculatePriorityScore(user.sellerBrands || [], marketData.demandMap, marketData.supplyMap)
        : null
    }))
  } catch (error) {
    console.error('CRITICAL: getAllUsersUseCase FAILED:', error)
    throw error
  }
}

export async function toggleUserBanUseCase(userId: string, isBanned: boolean) {
  return await toggleUserBan(userId, isBanned)
}

export async function getTaxonomyUseCase() {
  const [categories, brands] = await Promise.all([
    getPartCategories(),
    getVehicleBrands(),
  ])

  return {
    categories,
    brands,
  }
}

export async function createCategoryUseCase(data: CategoryInput) {
  return await createPartCategory(data)
}

export async function updateCategoryUseCase(id: string, data: Partial<CategoryInput>) {
  return await updatePartCategory(id, data)
}

export async function deleteCategoryUseCase(id: string) {
  return await deletePartCategory(id)
}

export async function createBrandUseCase(data: BrandInput) {
  return await createVehicleBrand(data)
}

export async function updateBrandUseCase(id: string, data: Partial<BrandInput>) {
  return await updateVehicleBrand(id, data)
}

export async function deleteBrandUseCase(id: string) {
  return await deleteVehicleBrand(id)
}

export async function getBuyerAnalyticsUseCase() {
  return await getCachedAnalytics('buyer', async () => {
    const [
      metrics,
      distribution,
      demandByCategory,
      demandByOrigin,
      regionalDemand,
      requestVolume,
      topBuyers,
    ] = await Promise.all([
      fetchBuyerMetrics(),
      fetchUserDistributionByWilaya('buyer'),
      fetchDemandByCategory(),
      fetchDemandByOrigin(),
      fetchRegionalDemand(),
      fetchRequestVolume(),
      fetchTopBuyers(),
    ])

    return {
      metrics,
      distribution,
      demandByCategory,
      demandByOrigin,
      regionalDemand,
      requestVolume,
      topBuyers,
    }
  })
}

export async function getSellerAnalyticsUseCase() {
  return await getCachedAnalytics('seller', async () => {
    const [metrics, distribution, segments, demandByCategory, quoteVolume] = await Promise.all([
      fetchSellerMetrics(),
      fetchUserDistributionByWilaya('seller'),
      fetchMerchantSegmentation(),
      fetchSellerCategoryFocus(),
      fetchQuoteVolume()
    ])
    
    return { 
      metrics, 
      distribution, 
      segments, 
      demandByCategory,
      requestVolume: quoteVolume 
    }
  })
}

export async function getAdvancedSystemMetricsUseCase() {
  const [systemMetrics, requestVolume, marketHealth] = await Promise.all([
    fetchAdvancedSystemMetrics(),
    fetchRequestVolume(),
    fetchMarketHealth(),
  ])

  return {
    ...systemMetrics,
    requestVolume,
    marketHealth,
  }
}

export async function getAdminDashboardStatsUseCase() {
  return await fetchAdminDashboardStats()
}

export async function activateSellerUseCase(userId: string, adminId?: string) {
  const { updateUserStatus } = await import('@/data-access/users')
  const { NotificationTriggers } = await import('@/services/notification-triggers')
  const { grantCredits } = await import('@/data-access/credits')

  await updateUserStatus(userId, 'active')

  // Grant 20 welcome credits
  try {
    await grantCredits(userId, 20, 'bonus', adminId, 'Welcome bonus — seller activation')
  } catch (error) {
    console.error('Failed to grant welcome credits:', error)
  }

  Promise.resolve().then(async () => {
    try {
      await NotificationTriggers.onAccountApproved(userId)
    } catch (error) {
      console.error('Failed to launch account approved notifications:', error)
    }
  })

  return { success: true }
}

export async function getUserDetailsUseCase(userId: string) {
  return await fetchUserDetailsQuery(userId)
}

export async function getMarketGapAnalysisUseCase() {
  return await getCachedAnalytics('marketGap', async () => {
    const [
      categoryGaps,
      brandGaps,
      regionalGaps,
      unservedCount,
      fulfillment,
    ] = await Promise.all([
      fetchCategoryGapAnalysis(),
      fetchBrandGapAnalysis(),
      fetchRegionalGapAnalysis(),
      fetchUnservedRequests(),
      fetchFulfillmentRate(),
    ])

    return {
      categoryGaps,
      brandGaps,
      regionalGaps,
      unservedCount,
      fulfillment,
    }
  })
}
