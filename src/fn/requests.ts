import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { User } from '@/lib/auth'
import {
  createRequestSchema,
  requestIdSchema,
  updateRequestSchema,
} from '@/types/request-schemas'
import {
  adminMiddleware,
  authMiddleware,
  buyerMiddleware,
  sellerMiddleware,
} from '@/features/auth/guards/auth'
import {
  cancelRequestUseCase,
  createRequestUseCase,
  deleteRequestUseCase,
  flagAsSpamUseCase,
  fulfillRequestUseCase,
  getAllRequestsUseCase,
  getBuyerRequestsUseCase,
  getOpenRequestsUseCase,
  getRequestDetailsUseCase,
  reopenRequestUseCase,
  updateRequestUseCase,
} from '@/use-cases/requests/index'
import { getTaxonomyUseCase } from '@/use-cases/admin/index'

/**
 * Axis Layer 3: Requests Actions
 */

export const createRequestServerFn = createServerFn({ method: 'POST' })
  .inputValidator(createRequestSchema)
  .middleware([buyerMiddleware])
  .handler(async ({ data, context }) => {
    return await createRequestUseCase({ ...data, buyerId: context.user.id })
  })

export const fetchBuyerRequestsServerFn = createServerFn({ method: 'GET' })
  .middleware([buyerMiddleware])
  .handler(async (ctx) => {
    const userId = ctx.context.user.id
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    return await getBuyerRequestsUseCase(userId)
  })

const openRequestFiltersSchema = z
  .object({
    limit: z.number().optional(),
    offset: z.number().optional(),
    categoryId: z.string().optional(),
    brandIds: z.array(z.string()).optional(),
    search: z.string().optional(),
    specialtyFilter: z
      .object({
        brandIds: z.array(z.string()),
        categoryIds: z.array(z.string()),
      })
      .optional(),
  })
  .optional()

export const fetchOpenRequestsServerFn = createServerFn({ method: 'GET' })
  .inputValidator(openRequestFiltersSchema)
  .middleware([sellerMiddleware])
  .handler(async ({ data }) => {
    return await getOpenRequestsUseCase(data)
  })

const publicRequestFiltersSchema = z
  .object({
    limit: z.number().optional(),
    offset: z.number().optional(),
    categoryId: z.string().optional(),
    brandIds: z.array(z.string()).optional(),
    search: z.string().optional(),
  })
  .optional()

export const fetchPublicOpenRequestsServerFn = createServerFn({ method: 'GET' })
  .inputValidator(publicRequestFiltersSchema)
  .handler(async ({ data }) => {
    return await getOpenRequestsUseCase(data)
  })

export const getPublicTaxonomyServerFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const res = await getTaxonomyUseCase()
  return { success: true, data: res }
})

export const fetchAllRequestsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return await getAllRequestsUseCase()
  })

export const fetchRequestDetailsServerFn = createServerFn({ method: 'GET' })
  .inputValidator(requestIdSchema)
  .middleware([authMiddleware])
  .handler(async ({ data: requestId, context }) => {
    return await getRequestDetailsUseCase(requestId, context.user as User)
  })

export const cancelRequestServerFn = createServerFn({ method: 'POST' })
  .inputValidator(requestIdSchema)
  .middleware([buyerMiddleware])
  .handler(async ({ data: requestId, context }) => {
    const user = context.user as User
    return await cancelRequestUseCase(requestId, user.id, user.role)
  })

export const reopenRequestServerFn = createServerFn({ method: 'POST' })
  .inputValidator(requestIdSchema)
  .middleware([buyerMiddleware])
  .handler(async ({ data: requestId, context }) => {
    const user = context.user as User
    return await reopenRequestUseCase(requestId, user.id, user.role)
  })

export const deleteRequestServerFn = createServerFn({ method: 'POST' })
  .inputValidator(requestIdSchema)
  .middleware([buyerMiddleware])
  .handler(async ({ data: requestId, context }) => {
    const user = context.user as User
    return await deleteRequestUseCase(requestId, user.id, user.role)
  })

export const updateRequestServerFn = createServerFn({ method: 'POST' })
  .inputValidator(updateRequestSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    const details = await getRequestDetailsUseCase(data.id, user)
    if ('error' in details) throw new Error(details.error)
    return await updateRequestUseCase(data.id, data.payload)
  })

export const flagAsSpamServerFn = createServerFn({ method: 'POST' })
  .inputValidator(requestIdSchema)
  .middleware([adminMiddleware])
  .handler(async ({ data: requestId }) => {
    return await flagAsSpamUseCase(requestId)
  })

export const fulfillRequestServerFn = createServerFn({ method: 'POST' })
  .inputValidator(requestIdSchema)
  .middleware([buyerMiddleware])
  .handler(async ({ data: requestId, context }) => {
    const user = context.user as User
    return await fulfillRequestUseCase(requestId, user.id, user.role)
  })
