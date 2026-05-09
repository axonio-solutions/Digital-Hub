import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import type { User } from '@/lib/auth'
import { buyerMiddleware, sellerMiddleware } from '@/features/auth/guards/auth'
import { acceptQuoteSchema, quoteSchema } from '@/types/quote-schemas'
import { db } from '@/db'
import { quotes, sparePartRequests } from '@/db/schema'
import { acceptQuoteUseCase, createQuoteUseCase, deleteQuoteUseCase, getQuotesBySellerUseCase, rejectQuoteUseCase, revokeQuoteUseCase, unrejectQuoteUseCase, updateQuoteUseCase } from '@/use-cases/quotes/index'

/**
 * Axis Layer 3: Quotes Actions
 */

export const createQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .middleware([sellerMiddleware])
  .handler(async ({ data }) => {
    const validated = quoteSchema.parse(data)
    return await createQuoteUseCase(validated)
  })

export const getSellerQuotesServerFn = createServerFn({ method: 'GET' })
  .middleware([sellerMiddleware])
  .handler(async ({ context }) => {
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

    return await unrejectQuoteUseCase(data.quoteId)
  })

export const fetchSellerStatsServerFn = createServerFn({ method: 'GET' })
  .middleware([sellerMiddleware])
  .handler(async ({ context }) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 1. Native Database Aggregation (No massive payload transfers)
    const queryStats = db.execute(sql`
      SELECT 
        COUNT(*) as total_quotes,
        SUM(CASE WHEN ${quotes.status} = 'accepted' THEN 1 ELSE 0 END) as won_quotes,
        SUM(CASE WHEN ${quotes.status} = 'pending' THEN 1 ELSE 0 END) as pending_quotes,
        SUM(CASE WHEN ${quotes.status} = 'accepted' THEN ${quotes.price} ELSE 0 END) as total_revenue
      FROM ${quotes}
      WHERE ${quotes.sellerId} = ${context.user.id}
    `)

    // 2. Today's stats for trend comparison
    const queryTodayStats = db.execute(sql`
      SELECT 
        SUM(CASE WHEN ${quotes.status} = 'accepted' THEN 1 ELSE 0 END) as today_won,
        SUM(CASE WHEN ${quotes.status} = 'pending' THEN 1 ELSE 0 END) as today_pending,
        SUM(CASE WHEN ${quotes.status} = 'accepted' THEN ${quotes.price} ELSE 0 END) as today_revenue
      FROM ${quotes}
      WHERE ${quotes.sellerId} = ${context.user.id}
        AND ${quotes.createdAt} >= ${today.toISOString()}
    `)

    // 3. Fetch only the strictly necessary rows for the UI
    const queryRecentSales = db.query.quotes.findMany({
      where: and(eq(quotes.sellerId, context.user.id as any), eq(quotes.status, 'accepted')),
      with: { request: true },
      orderBy: desc(quotes.updatedAt),
      limit: 4,
    })

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const queryChartQuotes = db.query.quotes.findMany({
      where: and(
        eq(quotes.sellerId, context.user.id as any),
        eq(quotes.status, 'accepted'),
        gte(quotes.updatedAt, sevenDaysAgo)
      ),
      columns: { price: true, updatedAt: true },
    })

    const [statsResult, todayResult, recentSales, chartQuotes] = await Promise.all([
      queryStats,
      queryTodayStats,
      queryRecentSales,
      queryChartQuotes,
    ])

    const row = statsResult[0] as any
    const todayRow = todayResult[0] as any
    const totalQuotes = Number(row.total_quotes || 0)
    const won = Number(row.won_quotes || 0)
    const pending = Number(row.pending_quotes || 0)
    const totalRevenue = Number(row.total_revenue || 0)
    const winRate = totalQuotes > 0 ? (won / totalQuotes) * 100 : 0

    return {
      stats: { won, pending, winRate, totalRevenue, totalQuotes },
      todayStats: {
        won: Number(todayRow.today_won || 0),
        pending: Number(todayRow.today_pending || 0),
        revenue: Number(todayRow.today_revenue || 0),
      },
      recentSales,
      chartQuotes,
    }
  })
