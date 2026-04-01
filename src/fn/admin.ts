import { createServerFn } from '@tanstack/react-start'
import type { User } from '@/lib/auth';
import { authMiddleware, adminMiddleware } from '@/features/auth/guards/auth'

/**
 * Axis Layer 3: Admin Actions
 */

export const getAllUsersServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { getAllUsersUseCase } = await import('@/use-cases/admin/index')
    return await getAllUsersUseCase()
  })

export const getAdminMetricsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { getAdminMetricsUseCase } = await import('@/use-cases/admin/index')
    return await getAdminMetricsUseCase()
  })

export const getBuyerAnalyticsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { getBuyerAnalyticsUseCase } = await import('@/use-cases/admin/index')
    return await getBuyerAnalyticsUseCase()
  })

export const getSellerAnalyticsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { getSellerAnalyticsUseCase } =
      await import('@/use-cases/admin/index')
    return await getSellerAnalyticsUseCase()
  })

export const getAdvancedSystemMetricsServerFn = createServerFn({
  method: 'GET',
})
  .middleware([adminMiddleware])
  .handler(async () => {
    const { getAdvancedSystemMetricsUseCase } =
      await import('@/use-cases/admin/index')
    return await getAdvancedSystemMetricsUseCase()
  })

export const getAdminDashboardStatsServerFn = createServerFn({
  method: 'GET',
})
  .middleware([adminMiddleware])
  .handler(async () => {
    const { getAdminDashboardStatsUseCase } =
      await import('@/use-cases/admin/index')
    return await getAdminDashboardStatsUseCase()
  })

export const toggleUserBanServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { userId: string; isBanned: boolean }) => data)
  .handler(async (ctx) => {
    const { toggleUserBanUseCase } = await import('@/use-cases/admin/index')
    return await toggleUserBanUseCase(ctx.data.userId, ctx.data.isBanned)
  })

export const activateSellerServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const { activateSellerUseCase } = await import('@/use-cases/admin/index')
    return await activateSellerUseCase(data.userId)
  })

export const getTaxonomyServerFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const { getTaxonomyUseCase } = await import('@/use-cases/admin/index')
    const res = await getTaxonomyUseCase()
    return { success: true, data: res }
  })

export const createCategoryServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { createCategoryUseCase } = await import('@/use-cases/admin/index')
    const res = await createCategoryUseCase(data.data || data)
    return { success: true, data: res }
  })

export const updateCategoryServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const payload = data.data || data
    const { updateCategoryUseCase } = await import('@/use-cases/admin/index')
    const res = await updateCategoryUseCase(payload.id, payload.data)
    return { success: true, data: res }
  })

export const deleteCategoryServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const id = typeof data === 'string' ? data : data.data
    const { deleteCategoryUseCase } = await import('@/use-cases/admin/index')
    const res = await deleteCategoryUseCase(id)
    return { success: true, data: res }
  })

export const createBrandServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { createBrandUseCase } = await import('@/use-cases/admin/index')
    const res = await createBrandUseCase(data.data || data)
    return { success: true, data: res }
  })

export const updateBrandServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const payload = data.data || data
    const { updateBrandUseCase } = await import('@/use-cases/admin/index')
    const res = await updateBrandUseCase(payload.id, payload.data)
    return { success: true, data: res }
  })

export const deleteBrandServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const id = typeof data === 'string' ? data : data.data
    const { deleteBrandUseCase } = await import('@/use-cases/admin/index')
    const res = await deleteBrandUseCase(id)
    return { success: true, data: res }
  })
