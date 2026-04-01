import { createServerFn } from '@tanstack/react-start'
import { createRequestSchema } from '@/types/request-schemas'
import { authMiddleware, adminMiddleware, buyerMiddleware, sellerMiddleware } from '@/features/auth/guards/auth'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { sparePartRequests } from '@/db/schema'
import { type User } from '@/lib/auth'

/**
 * Axis Layer 3: Requests Actions
 */

export const createRequestServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .middleware([buyerMiddleware])
  .handler(async ({ data }) => {
    const { createRequestUseCase } = await import('@/use-cases/requests/index')
    const validated = createRequestSchema.parse(data)
    return await createRequestUseCase(validated)
  })

export const fetchBuyerRequestsServerFn = createServerFn({ method: 'GET' })
  .middleware([buyerMiddleware])
  .handler(async (ctx) => {
    const userId = ctx.context?.user?.id as string | undefined
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    const { getBuyerRequestsUseCase } =
      await import('@/use-cases/requests/index')
    return await getBuyerRequestsUseCase(userId)
  })

export const fetchOpenRequestsServerFn = createServerFn({ method: 'GET' })
  .middleware([sellerMiddleware])
  .inputValidator((data: {
    limit?: number;
    offset?: number;
    categoryId?: string;
    brandIds?: string[];
    search?: string;
    specialtyFilter?: {
      brandIds: string[];
      categoryIds: string[];
    };
  } | undefined) => data)
  .handler(async ({ data }) => {
    const { getOpenRequestsUseCase } =
      await import('@/use-cases/requests/index')
    return await getOpenRequestsUseCase(data)
  })

export const fetchPublicOpenRequestsServerFn = createServerFn({ method: 'GET' })
  .inputValidator((data: {
    limit?: number;
    offset?: number;
    categoryId?: string;
    brandIds?: string[];
    search?: string;
  }) => data)
  .handler(async ({ data }) => {
    const { getOpenRequestsUseCase } =
      await import('@/use-cases/requests/index')
    return await getOpenRequestsUseCase(data)
  })

export const getPublicTaxonomyServerFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { getTaxonomyUseCase } = await import('@/use-cases/admin/index')
    const res = await getTaxonomyUseCase()
    return { success: true, data: res }
  })

export const fetchAllRequestsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { getAllRequestsUseCase } = await import('@/use-cases/requests/index')
    return await getAllRequestsUseCase()
  })

export const fetchRequestDetailsServerFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((requestId: string) => requestId)
  .handler(async ({ data: requestId, context }) => {
    const { getRequestDetailsUseCase } =
      await import('@/use-cases/requests/index')
    return await getRequestDetailsUseCase(requestId, context.user as User)
  })

export const cancelRequestServerFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((requestId: string) => requestId)
  .handler(async ({ data: requestId, context }) => {
    const user = context.user as User
    const request = await db.query.sparePartRequests.findFirst({
      where: eq(sparePartRequests.id, requestId as any),
    })

    if (!request) throw new Error('Request not found')
    if (request.buyerId !== user.id && user.role !== 'admin') {
      throw new Error('Forbidden: You do not own this request')
    }

    const { cancelRequestUseCase } = await import('@/use-cases/requests/index')
    return await cancelRequestUseCase(requestId)
  })

export const reopenRequestServerFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((requestId: string) => requestId)
  .handler(async ({ data: requestId, context }) => {
    const user = context.user as User
    const request = await db.query.sparePartRequests.findFirst({
      where: eq(sparePartRequests.id, requestId as any),
    })

    if (!request) throw new Error('Request not found')
    if (request.buyerId !== user.id && user.role !== 'admin') {
      throw new Error('Forbidden: You do not own this request')
    }

    const { reopenRequestUseCase } = await import('@/use-cases/requests/index')
    return await reopenRequestUseCase(requestId)
  })

export const deleteRequestServerFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((requestId: string) => requestId)
  .handler(async ({ data: requestId, context }) => {
    const user = context.user as User
    const request = await db.query.sparePartRequests.findFirst({
      where: eq(sparePartRequests.id, requestId as any),
    })

    if (!request) throw new Error('Request not found')
    if (request.buyerId !== user.id && user.role !== 'admin') {
      throw new Error('Forbidden: You do not own this request')
    }

    const { deleteRequestUseCase } = await import('@/use-cases/requests/index')
    return await deleteRequestUseCase(requestId)
  })

export const updateRequestServerFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: { id: string; payload: any }) => data)
  .handler(async ({ data, context }) => {
    const user = context.user as User
    const request = await db.query.sparePartRequests.findFirst({
      where: eq(sparePartRequests.id, data.id as any),
    })

    if (!request) throw new Error('Request not found')
    if (request.buyerId !== user.id && user.role !== 'admin') {
      throw new Error('Forbidden: You do not own this request')
    }

    const { updateRequestUseCase } = await import('@/use-cases/requests/index')
    return await updateRequestUseCase(data.id, data.payload)
  })

export const flagAsSpamServerFn = createServerFn({ method: 'POST' })
  .inputValidator((requestId: string) => requestId)
  .middleware([adminMiddleware])
  .handler(async ({ data: requestId }) => {
    const { flagAsSpamUseCase } = await import('@/use-cases/requests/index')
    return await flagAsSpamUseCase(requestId)
  })
