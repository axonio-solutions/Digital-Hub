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
  fetchGapSummary,
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
}

export async function getSellerAnalyticsUseCase() {
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
}

export async function getAdvancedSystemMetricsUseCase(days?: number) {
  const [systemMetrics, requestVolume, quoteVolume, marketHealth] = await Promise.all([
    fetchAdvancedSystemMetrics(days),
    fetchRequestVolume(days ?? 30),
    fetchQuoteVolume(days ?? 30),
    fetchMarketHealth(days),
  ])

  return {
    ...systemMetrics,
    requestVolume,
    quoteVolume,
    marketHealth,
  }
}

export async function getAdminDashboardStatsUseCase(days?: number) {
  return await fetchAdminDashboardStats(days)
}

export async function activateSellerUseCase(userId: string, adminId?: string) {
  const { updateUserStatus } = await import('@/data-access/users')
  const { NotificationTriggers } = await import('@/services/notification-triggers')
  const { grantCredits } = await import('@/data-access/credits')

  await updateUserStatus(userId, 'active')

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
  const [categoryGaps, brandGaps, regionalGaps, gapSummary] = await Promise.all([
    fetchCategoryGapAnalysis(),
    fetchBrandGapAnalysis(),
    fetchRegionalGapAnalysis(),
    fetchGapSummary(),
  ])

  return {
    categoryGaps,
    brandGaps,
    regionalGaps,
    unservedCount: gapSummary.unserved,
    fulfillment: { total: gapSummary.total, fulfilled: gapSummary.fulfilled, rate: gapSummary.rate },
  }
}
