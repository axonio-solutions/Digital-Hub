import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware, authMiddleware } from '@/features/auth/guards/auth'
import {
  activateSellerUseCase,
  createBrandUseCase,
  createCategoryUseCase,
  deleteBrandUseCase,
  deleteCategoryUseCase,
  getAdminDashboardStatsUseCase,
  getAdminMetricsUseCase,
  getAdvancedSystemMetricsUseCase,
  getAllUsersUseCase,
  getBuyerAnalyticsUseCase,
  getMarketGapAnalysisUseCase,
  getSellerAnalyticsUseCase,
  getTaxonomyUseCase,
  getUserDetailsUseCase,
  toggleUserBanUseCase,
  updateBrandUseCase,
  updateCategoryUseCase,
} from '@/use-cases/admin/index'

/**
 * Axis Layer 3: Admin Actions
 */

export const getAllUsersServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return await getAllUsersUseCase()
  })

export const getAdminMetricsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return await getAdminMetricsUseCase()
  })

export const getBuyerAnalyticsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return await getBuyerAnalyticsUseCase()
  })

export const getSellerAnalyticsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return await getSellerAnalyticsUseCase()
  })

export const getAdvancedSystemMetricsServerFn = createServerFn({
  method: 'POST',
})
  .middleware([adminMiddleware])
  .inputValidator((data: { days?: number }) => data)
  .handler(async ({ data }) => {
    return await getAdvancedSystemMetricsUseCase(data.days)
  })

export const getAdminDashboardStatsServerFn = createServerFn({
  method: 'POST',
})
  .middleware([adminMiddleware])
  .inputValidator((data: { days?: number }) => data)
  .handler(async ({ data }) => {
    return await getAdminDashboardStatsUseCase(data.days)
  })

export const toggleUserBanServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { userId: string; isBanned: boolean }) => data)
  .handler(async (ctx) => {
    return await toggleUserBanUseCase(ctx.data.userId, ctx.data.isBanned)
  })

export const activateSellerServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data, context }) => {
    return await activateSellerUseCase(data.userId, context.user?.id)
  })

export const getTaxonomyServerFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const res = await getTaxonomyUseCase()
    return { success: true, data: res }
  })

export const createCategoryServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const res = await createCategoryUseCase(data.data || data)
    return { success: true, data: res }
  })

export const updateCategoryServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const res = await updateCategoryUseCase(data.id, data.data)
    return { success: true, data: res }
  })

export const deleteCategoryServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const id = typeof data === 'string' ? data : data.data
    const res = await deleteCategoryUseCase(id)
    return { success: true, data: res }
  })

export const createBrandServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const res = await createBrandUseCase(data.data || data)
    return { success: true, data: res }
  })

export const updateBrandServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const res = await updateBrandUseCase(data.id, data.data)
    return { success: true, data: res }
  })

export const deleteBrandServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const id = typeof data === 'string' ? data : data.data
    const res = await deleteBrandUseCase(id)
    return { success: true, data: res }
  })

export const getUserDetailsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    return await getUserDetailsUseCase(data.userId)
  })

export const getMarketGapAnalysisServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return await getMarketGapAnalysisUseCase()
  })
