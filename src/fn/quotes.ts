import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import type { User } from '@/lib/auth'
import {
  adminMiddleware,
  buyerMiddleware,
  sellerMiddleware,
} from '@/features/auth/guards/auth'
import { quoteSchema } from '@/types/quote-schemas'
import { db } from '@/db'
import { quotes } from '@/db/schema'
import {
  acceptQuoteUseCase,
  createQuoteUseCase,
  deleteQuoteUseCase,
  getQuotesBySellerUseCase,
  rejectQuoteUseCase,
  revokeQuoteUseCase,
  unrejectQuoteUseCase,
  updateQuoteUseCase,
} from '@/use-cases/quotes/index'
import { NotificationTriggers } from '@/services/notification-triggers'
import {
  fetchAnonymousQuotesQuery,
  fetchSellerQuoteForRequest,
} from '@/data-access/quotes'

export const createQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .middleware([sellerMiddleware])
  .handler(async ({ data, context }) => {
    const validated = quoteSchema.parse(data)
    return await createQuoteUseCase(validated, context.user.id)
  })

export const getSellerQuotesServerFn = createServerFn({ method: 'GET' })
  .middleware([sellerMiddleware])
  .handler(async ({ context }) => {
    return await getQuotesBySellerUseCase(context.user.id)
  })

export const acceptQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { quoteId: string }) => data)
  .middleware([buyerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    return await acceptQuoteUseCase(data.quoteId, user.id, user.role)
  })

export const revokeQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { quoteId: string }) => data)
  .middleware([buyerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    return await revokeQuoteUseCase(data.quoteId, user.id, user.role)
  })

export const rejectQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { quoteId: string }) => data)
  .middleware([buyerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    return await rejectQuoteUseCase(data.quoteId, user.id, user.role)
  })

export const unrejectQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { quoteId: string }) => data)
  .middleware([buyerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    return await unrejectQuoteUseCase(data.quoteId, user.id, user.role)
  })

export const deleteQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    return await deleteQuoteUseCase(data.id)
  })

export const retractQuoteServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .middleware([sellerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, data.id as any),
    })
    if (!quote) throw new Error('Quote not found')
    if (quote.sellerId !== user.id) throw new Error('Forbidden')
    if (quote.status === 'accepted')
      throw new Error('Cannot retract an accepted quote')
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

export const sendReminderServerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { quoteId: string }) => data)
  .middleware([sellerMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user as User
    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, data.quoteId as any),
    })
    if (!quote) throw new Error('Quote not found')
    if (quote.sellerId !== user.id)
      throw new Error('Forbidden: You do not own this quote')
    if (quote.status !== 'accepted')
      throw new Error('Can only remind buyer on an accepted quote')

    await NotificationTriggers.onSellerReminder(data.quoteId)
    return { success: true }
  })

function localMidnightUTC(offsetMinutes: number): Date {
  const now = new Date()
  // Shift to user's local time (offsetMinutes = getTimezoneOffset(): negative for UTC+)
  const localMs = now.getTime() - offsetMinutes * 60_000
  const localDate = new Date(localMs)
  localDate.setUTCHours(0, 0, 0, 0) // midnight in local coordinates
  // Shift back to UTC for the DB query
  return new Date(localDate.getTime() + offsetMinutes * 60_000)
}

export const fetchSellerStatsServerFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { tzOffset?: number }) => data)
  .middleware([sellerMiddleware])
  .handler(async ({ data, context }) => {
    const today = localMidnightUTC(data.tzOffset ?? 0)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const queryStats = db.execute(sql`
      SELECT
        COUNT(*) as total_quotes,
        SUM(CASE WHEN ${quotes.status} = 'accepted' THEN 1 ELSE 0 END) as won_quotes,
        SUM(CASE WHEN ${quotes.status} = 'pending' THEN 1 ELSE 0 END) as pending_quotes,
        SUM(CASE WHEN ${quotes.status} = 'accepted' THEN ${quotes.price} ELSE 0 END) as total_revenue
      FROM ${quotes}
      WHERE ${quotes.sellerId} = ${context.user.id}
    `)

    const todayIso = today.toISOString()
    const queryTodayStats = db.execute(sql`
      SELECT
        SUM(CASE WHEN ${quotes.status} = 'accepted' AND ${quotes.updatedAt} >= ${todayIso} THEN 1 ELSE 0 END) as today_won,
        SUM(CASE WHEN ${quotes.status} = 'pending'  AND ${quotes.createdAt} >= ${todayIso} THEN 1 ELSE 0 END) as today_pending,
        SUM(CASE WHEN ${quotes.status} = 'rejected' AND ${quotes.updatedAt} >= ${todayIso} THEN 1 ELSE 0 END) as today_lost,
        SUM(CASE WHEN ${quotes.status} = 'accepted' AND ${quotes.updatedAt} >= ${todayIso} THEN ${quotes.price} ELSE 0 END) as today_revenue
      FROM ${quotes}
      WHERE ${quotes.sellerId} = ${context.user.id}
    `)

    const queryRecentSales = db.query.quotes.findMany({
      where: and(
        eq(quotes.sellerId, context.user.id as any),
        eq(quotes.status, 'accepted'),
      ),
      with: { request: true },
      orderBy: desc(quotes.updatedAt),
      limit: 4,
    })

    const queryChartQuotes = db.query.quotes.findMany({
      where: and(
        eq(quotes.sellerId, context.user.id as any),
        eq(quotes.status, 'accepted'),
        gte(quotes.updatedAt, sevenDaysAgo),
      ),
      columns: { price: true, updatedAt: true },
    })

    const [statsResult, todayResult, recentSales, chartQuotes] =
      await Promise.all([
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
        lost: Number(todayRow.today_lost || 0),
        revenue: Number(todayRow.today_revenue || 0),
      },
      recentSales,
      chartQuotes,
    }
  })

export const getAnonymousQuotesServerFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { requestId: string }) => data)
  .middleware([sellerMiddleware])
  .handler(async ({ data }) => {
    const rows = await fetchAnonymousQuotesQuery(data.requestId)
    return { success: true, data: rows }
  })

export const getMyQuoteForRequestServerFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { requestId: string }) => data)
  .middleware([sellerMiddleware])
  .handler(async ({ data, context }) => {
    const quote = await fetchSellerQuoteForRequest(
      data.requestId,
      context.user.id,
    )
    return { success: true, data: quote }
  })
