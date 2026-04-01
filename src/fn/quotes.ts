import { createServerFn } from '@tanstack/react-start'
import { acceptQuoteSchema, quoteSchema } from '@/types/quote-schemas'
import { sellerMiddleware, buyerMiddleware } from '@/features/auth/guards/auth'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { quotes, sparePartRequests } from '@/db/schema'
import { type User } from '@/lib/auth'

/**
 * Axis Layer 3: Quotes Actions
 */

export const createQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .middleware([sellerMiddleware])
  .handler(async ({ data }) => {
    const { createQuoteUseCase } = await import('@/use-cases/quotes/index')
    const validated = quoteSchema.parse(data)
    return await createQuoteUseCase(validated)
  })

export const getSellerQuotesServerFn = createServerFn({ method: 'GET' })
  .middleware([sellerMiddleware])
  .handler(async ({ context }) => {
    const { getQuotesBySellerUseCase } =
      await import('@/use-cases/quotes/index')
    return await getQuotesBySellerUseCase(context.user.id)
  })

export const acceptQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .middleware([buyerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    const validated = acceptQuoteSchema.parse(data)

    // Verify the request belongs to the buyer
    const request = await db.query.sparePartRequests.findFirst({
      where: eq(sparePartRequests.id, validated.requestId as any),
    })

    if (!request) throw new Error('Request not found')
    if (request.buyerId !== user.id && user.role !== 'admin') {
      throw new Error('Forbidden: You do not own this request')
    }

    const { acceptQuoteUseCase } = await import('@/use-cases/quotes/index')
    return await acceptQuoteUseCase(validated.quoteId, validated.requestId)
  })

export const deleteQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .middleware([sellerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, data.id as any),
    })

    if (!quote) throw new Error('Quote not found')
    if (quote.sellerId !== user.id && user.role !== 'admin') {
      throw new Error('Forbidden: You do not own this quote')
    }

    const { deleteQuoteUseCase } = await import('@/use-cases/quotes/index')
    return await deleteQuoteUseCase(data.id)
  })

export const updateQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; data: any }) => data)
  .middleware([sellerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, data.id as any),
    })

    if (!quote) throw new Error('Quote not found')
    if (quote.sellerId !== user.id && user.role !== 'admin') {
      throw new Error('Forbidden: You do not own this quote')
    }

    const { updateQuoteUseCase } = await import('@/use-cases/quotes/index')
    const validated = quoteSchema.parse(data.data)
    return await updateQuoteUseCase(data.id, validated)
  })

export const revokeQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { quoteId: string; requestId: string }) => data)
  .middleware([buyerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    
    // Verify the request belongs to the buyer
    const request = await db.query.sparePartRequests.findFirst({
      where: eq(sparePartRequests.id, data.requestId as any),
    })

    if (!request) throw new Error('Request not found')
    if (request.buyerId !== user.id && user.role !== 'admin') {
      throw new Error('Forbidden: You do not own this request')
    }

    const { revokeQuoteUseCase } = await import('@/use-cases/quotes/index')
    return await revokeQuoteUseCase(data.quoteId, data.requestId)
  })

export const rejectQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { quoteId: string }) => data)
  .middleware([buyerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    
    // Verify ownership via quote -> request -> buyerId
    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, data.quoteId as any),
      with: {
        request: true
      }
    }) as any

    if (!quote) throw new Error('Quote not found')
    if (quote.request.buyerId !== user.id && user.role !== 'admin') {
      throw new Error('Forbidden: You do not own this request')
    }

    const { rejectQuoteUseCase } = await import('@/use-cases/quotes/index')
    return await rejectQuoteUseCase(data.quoteId)
  })

export const unrejectQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { quoteId: string }) => data)
  .middleware([buyerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    
    // Verify ownership via quote -> request -> buyerId
    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, data.quoteId as any),
      with: {
        request: true
      }
    }) as any

    if (!quote) throw new Error('Quote not found')
    if (quote.request.buyerId !== user.id && user.role !== 'admin') {
      throw new Error('Forbidden: You do not own this request')
    }

    const { unrejectQuoteUseCase } = await import('@/use-cases/quotes/index')
    return await unrejectQuoteUseCase(data.quoteId)
  })
