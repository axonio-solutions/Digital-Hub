import { createFileRoute } from '@tanstack/react-router'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import type { User } from '@/lib/auth'
import { db } from '@/db'
import { sessions, users } from '@/db/schema/auth'
import { quotes } from '@/db/schema'
import { quoteSchema } from '@/types/quote-schemas'
import { NotificationTriggers } from '@/services/notification-triggers'
import { updateSellerSpecialties } from '@/data-access/vendors'
import { fetchAnonymousQuotesQuery } from '@/data-access/quotes'
import {
  cancelRequestUseCase,
  createRequestUseCase,
  deleteRequestUseCase,
  fulfillRequestUseCase,
  getBuyerRequestsUseCase,
  getOpenRequestsUseCase,
  getRequestDetailsUseCase,
  reopenRequestUseCase,
  updateRequestUseCase,
} from '@/use-cases/requests/index'
import { getTaxonomyUseCase } from '@/use-cases/admin/index'
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
import {
  getUnreadNotificationsUseCase,
  markAllAsReadUseCase,
  markNotificationAsReadUseCase,
} from '@/use-cases/notifications/index'
import { submitSupportTicketUseCase } from '@/use-cases/support/index'
import {
  deactivateAccountUseCase,
  deleteAccountUseCase,
  updateProfileUseCase,
} from '@/use-cases/accounts/index'
import {
  getCreditPackagesUseCase,
  getCreditTransactionsUseCase,
  getSellerCreditsUseCase,
  requestCreditsUseCase,
} from '@/use-cases/credits/index'
import {
  badRequest,
  forbidden,
  getSessionUser,
  json,
  notFound,
  unauthorized,
} from '@/lib/api-utils'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2'

// ─── Payload helpers ─────────────────────────────────────────

function uploadNanoid(len: number) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len)
}

async function parseBody(request: Request): Promise<unknown> {
  const text = await request.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

function parseGetPayload(request: Request): unknown {
  const url = new URL(request.url)
  const raw = url.searchParams.get('payload')
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

// ─── GET handlers ────────────────────────────────────────────

async function handleGetSession(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  return json(user)
}

async function handleGetTaxonomy(): Promise<Response> {
  const data = await getTaxonomyUseCase()
  return json({ success: true, data })
}

async function handleGetBuyerRequests(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'buyer' && user.role !== 'admin') return forbidden()
  return json(await getBuyerRequestsUseCase(user.id))
}

async function handleGetOpenRequests(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'seller' && user.role !== 'admin') return forbidden()
  const filters = parseGetPayload(request) as any
  return json(await getOpenRequestsUseCase(filters))
}

async function handleGetPublicRequests(request: Request): Promise<Response> {
  const filters = parseGetPayload(request) as any
  return json(await getOpenRequestsUseCase(filters))
}

async function handleGetRequestDetails(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  const requestId = parseGetPayload(request) as string
  if (!requestId) return badRequest('Missing request id')
  const data = await getRequestDetailsUseCase(requestId, user)
  return json(data)
}

async function handleGetSellerQuotes(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'seller' && user.role !== 'admin') return forbidden()
  return json(await getQuotesBySellerUseCase(user.id))
}

function localMidnightUTC(offsetMinutes: number): Date {
  const now = new Date()
  const localMs = now.getTime() - offsetMinutes * 60_000
  const localDate = new Date(localMs)
  localDate.setUTCHours(0, 0, 0, 0)
  return new Date(localDate.getTime() + offsetMinutes * 60_000)
}

async function handleGetSellerStats(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'seller' && user.role !== 'admin') return forbidden()

  const payload = parseGetPayload(request) as { tzOffset?: number } | undefined
  const today = localMidnightUTC(payload?.tzOffset ?? 0)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const todayIso = today.toISOString()

  const [statsResult, todayResult, recentSales, chartQuotes] =
    await Promise.all([
      db.execute(sql`
        SELECT
          COUNT(*) as total_quotes,
          SUM(CASE WHEN ${quotes.status} = 'accepted' THEN 1 ELSE 0 END) as won_quotes,
          SUM(CASE WHEN ${quotes.status} = 'pending' THEN 1 ELSE 0 END) as pending_quotes,
          SUM(CASE WHEN ${quotes.status} = 'accepted' THEN ${quotes.price} ELSE 0 END) as total_revenue
        FROM ${quotes}
        WHERE ${quotes.sellerId} = ${user.id}
      `),
      db.execute(sql`
        SELECT
          SUM(CASE WHEN ${quotes.status} = 'accepted' AND ${quotes.updatedAt} >= ${todayIso} THEN 1 ELSE 0 END) as today_won,
          SUM(CASE WHEN ${quotes.status} = 'pending'  AND ${quotes.createdAt} >= ${todayIso} THEN 1 ELSE 0 END) as today_pending,
          SUM(CASE WHEN ${quotes.status} = 'rejected' AND ${quotes.updatedAt} >= ${todayIso} THEN 1 ELSE 0 END) as today_lost,
          SUM(CASE WHEN ${quotes.status} = 'accepted' AND ${quotes.updatedAt} >= ${todayIso} THEN ${quotes.price} ELSE 0 END) as today_revenue
        FROM ${quotes}
        WHERE ${quotes.sellerId} = ${user.id}
      `),
      db.query.quotes.findMany({
        where: and(
          eq(quotes.sellerId, user.id as any),
          eq(quotes.status, 'accepted'),
        ),
        with: { request: true },
        orderBy: desc(quotes.updatedAt),
        limit: 4,
      }),
      db.query.quotes.findMany({
        where: and(
          eq(quotes.sellerId, user.id as any),
          eq(quotes.status, 'accepted'),
          gte(quotes.updatedAt, sevenDaysAgo),
        ),
        columns: { price: true, updatedAt: true },
      }),
    ])

  const row = statsResult[0] as any
  const todayRow = todayResult[0] as any
  const totalQuotes = Number(row.total_quotes || 0)
  const won = Number(row.won_quotes || 0)
  const totalRevenue = Number(row.total_revenue || 0)
  const winRate = totalQuotes > 0 ? (won / totalQuotes) * 100 : 0

  return json({
    stats: {
      won,
      pending: Number(row.pending_quotes || 0),
      winRate,
      totalRevenue,
      totalQuotes,
    },
    todayStats: {
      won: Number(todayRow.today_won || 0),
      pending: Number(todayRow.today_pending || 0),
      lost: Number(todayRow.today_lost || 0),
      revenue: Number(todayRow.today_revenue || 0),
    },
    recentSales,
    chartQuotes,
  })
}

async function handleGetUnreadNotifications(
  request: Request,
): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  return json(await getUnreadNotificationsUseCase(user.id, 10))
}

async function handleGetAnonymousQuotes(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'seller' && user.role !== 'admin') return forbidden()
  const requestId = parseGetPayload(request) as string
  if (!requestId) return badRequest('Missing requestId')
  const data = await fetchAnonymousQuotesQuery(requestId)
  return json({ success: true, data })
}

async function handlePostUploadImage(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  const body = (await parseBody(request)) as {
    base64?: string
    folder?: string
  }
  if (!body.base64 || !body.folder)
    return badRequest('Missing base64 or folder')
  const ALLOWED = ['requests', 'profiles']
  if (!ALLOWED.includes(body.folder)) return badRequest('Invalid folder')
  const folderPath =
    body.folder === 'profiles' ? `profiles/${user.id}` : `requests/${user.id}`
  const key = `${folderPath}/${Date.now()}-${uploadNanoid(8)}.webp`
  const buffer = Buffer.from(body.base64, 'base64')
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/webp',
    }),
  )
  const baseUrl =
    R2_PUBLIC_URL || 'https://pub-2c0e06d8b4bd4dad9fba99227f84031b.r2.dev'
  return json({ success: true, publicUrl: `${baseUrl}/${key}` })
}

async function handleGetCreditBalance(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  const [balance, transactions] = await Promise.all([
    getSellerCreditsUseCase(user.id),
    getCreditTransactionsUseCase(user.id),
  ])
  return json({ balance, transactions })
}

async function handleGetCreditPackages(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  return json(await getCreditPackagesUseCase())
}

// ─── POST handlers ───────────────────────────────────────────

async function handlePostCompleteOnboarding(
  request: Request,
): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()

  const data = (await parseBody(request)) as any

  const newStatus = data.role === 'buyer' ? 'active' : 'waitlisted'

  await db
    .update(users)
    .set({
      name: data.name,
      email: data.email,
      role: data.role,
      phoneNumber: data.phoneNumber,
      whatsappNumber: data.whatsappNumber,
      storeName: data.storeName,
      wilaya: data.wilaya,
      city: data.city,
      address: data.address,
      companyAddress: data.companyAddress,
      commercialRegister: data.commercialRegister,
      image: data.image,
      account_status: newStatus,
    })
    .where(eq(users.id, user.id))

  await db
    .update(sessions)
    .set({ updatedAt: new Date() })
    .where(eq(sessions.userId, user.id))

  if (data.role === 'seller') {
    await updateSellerSpecialties(
      user.id,
      data.brandIds || [],
      data.categoryIds || [],
    )
    NotificationTriggers.onNewSellerWaitlist(user.id, data.name).catch(
      console.error,
    )
  }

  return json({ success: true, account_status: newStatus })
}

async function handlePostCreateRequest(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'buyer' && user.role !== 'admin') return forbidden()
  const data = (await parseBody(request)) as any
  return json(await createRequestUseCase({ ...data, buyerId: user.id }))
}

async function handlePostCancelRequest(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'buyer' && user.role !== 'admin') return forbidden()
  const requestId = (await parseBody(request)) as string
  return json(
    await cancelRequestUseCase(requestId, user.id, user.role as string),
  )
}

async function handlePostReopenRequest(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'buyer' && user.role !== 'admin') return forbidden()
  const requestId = (await parseBody(request)) as string
  return json(
    await reopenRequestUseCase(requestId, user.id, user.role as string),
  )
}

async function handlePostDeleteRequest(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'buyer' && user.role !== 'admin') return forbidden()
  const requestId = (await parseBody(request)) as string
  return json(
    await deleteRequestUseCase(requestId, user.id, user.role as string),
  )
}

async function handlePostUpdateRequest(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  const body = (await parseBody(request)) as { id: string; payload: any }
  const details = await getRequestDetailsUseCase(body.id, user)
  if ('error' in (details as any)) throw new Error((details as any).error)
  return json(await updateRequestUseCase(body.id, body.payload))
}

async function handlePostFulfillRequest(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'buyer' && user.role !== 'admin') return forbidden()
  const requestId = (await parseBody(request)) as string
  return json(
    await fulfillRequestUseCase(requestId, user.id, user.role as string),
  )
}

async function handlePostCreateQuote(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'seller' && user.role !== 'admin') return forbidden()
  const data = (await parseBody(request)) as any
  const validated = quoteSchema.parse(data)
  return json(await createQuoteUseCase(validated, user.id))
}

async function handlePostUpdateQuote(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'seller' && user.role !== 'admin') return forbidden()
  const body = (await parseBody(request)) as { id: string; data: any }
  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.id, body.id as any),
  })
  if (!quote) throw new Error('Quote not found')
  if (quote.sellerId !== user.id && user.role !== 'admin')
    throw new Error('Forbidden: You do not own this quote')
  const validated = quoteSchema.parse(body.data)
  return json(await updateQuoteUseCase(body.id, validated))
}

async function handlePostAcceptQuote(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'buyer' && user.role !== 'admin') return forbidden()
  const { quoteId } = (await parseBody(request)) as { quoteId: string }
  return json(await acceptQuoteUseCase(quoteId, user.id, user.role as string))
}

async function handlePostRejectQuote(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'buyer' && user.role !== 'admin') return forbidden()
  const { quoteId } = (await parseBody(request)) as { quoteId: string }
  return json(await rejectQuoteUseCase(quoteId, user.id, user.role as string))
}

async function handlePostRevokeQuote(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'buyer' && user.role !== 'admin') return forbidden()
  const { quoteId } = (await parseBody(request)) as { quoteId: string }
  return json(await revokeQuoteUseCase(quoteId, user.id, user.role as string))
}

async function handlePostUnrejectQuote(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'buyer' && user.role !== 'admin') return forbidden()
  const { quoteId } = (await parseBody(request)) as { quoteId: string }
  return json(await unrejectQuoteUseCase(quoteId, user.id, user.role as string))
}

async function handlePostRetractQuote(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'seller' && user.role !== 'admin') return forbidden()
  const { id } = (await parseBody(request)) as { id: string }
  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.id, id as any),
  })
  if (!quote) throw new Error('Quote not found')
  if (quote.sellerId !== user.id) throw new Error('Forbidden')
  if (quote.status === 'accepted')
    throw new Error('Cannot retract an accepted quote')
  return json(await deleteQuoteUseCase(id))
}

async function handlePostSendReminder(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'seller' && user.role !== 'admin') return forbidden()
  const { quoteId } = (await parseBody(request)) as { quoteId: string }
  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.id, quoteId as any),
  })
  if (!quote) throw new Error('Quote not found')
  if (quote.sellerId !== user.id)
    throw new Error('Forbidden: You do not own this quote')
  if (quote.status !== 'accepted')
    throw new Error('Can only remind buyer on an accepted quote')
  await NotificationTriggers.onSellerReminder(quoteId)
  return json({ success: true })
}

async function handlePostMarkNotificationRead(
  request: Request,
): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  const notificationId = (await parseBody(request)) as string
  return json(await markNotificationAsReadUseCase(notificationId, user.id))
}

async function handlePostMarkAllNotificationsRead(
  request: Request,
): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  return json(await markAllAsReadUseCase(user.id))
}

async function handlePostUpdateProfile(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  const body = (await parseBody(request)) as {
    userId: string
    updates: any
  }
  if (user.id !== body.userId && user.role !== 'admin')
    throw new Error('Unauthorized profile update')
  return json(await updateProfileUseCase(body.userId, body.updates))
}

async function handlePostDeactivateAccount(
  request: Request,
): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  const { userId } = (await parseBody(request)) as { userId: string }
  if (user.id !== userId && user.role !== 'admin')
    throw new Error('Unauthorized account deactivation')
  return json(await deactivateAccountUseCase(userId))
}

async function handlePostDeleteAccount(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  const { userId } = (await parseBody(request)) as { userId: string }
  if (user.id !== userId && user.role !== 'admin')
    throw new Error('Unauthorized account deletion')
  return json(await deleteAccountUseCase(userId))
}

async function handlePostRequestCredits(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  if (user.role !== 'seller' && user.role !== 'admin') return forbidden()
  const { credits, packageId } = (await parseBody(request)) as {
    credits: number
    packageId?: string
  }
  return json(await requestCreditsUseCase(user.id, credits, packageId))
}

async function handlePostSupportTicket(request: Request): Promise<Response> {
  const user = await getSessionUser(request)
  if (!user) return unauthorized()
  const body = (await parseBody(request)) as {
    subject: string
    category: string
    message: string
  }
  return json(
    await submitSupportTicketUseCase({
      userId: user.id,
      userEmail: user.email,
      userName: user.name ?? user.email,
      subject: body.subject,
      category: body.category,
      message: body.message,
    }),
  )
}

// ─── Dispatcher maps ─────────────────────────────────────────

type Handler = (request: Request) => Promise<Response>

const GET_ROUTES: Record<string, Handler> = {
  '/api/v1/session': handleGetSession,
  '/api/v1/taxonomy': handleGetTaxonomy,
  '/api/v1/requests/buyer': handleGetBuyerRequests,
  '/api/v1/requests/open': handleGetOpenRequests,
  '/api/v1/requests/public': handleGetPublicRequests,
  '/api/v1/requests/details': handleGetRequestDetails,
  '/api/v1/quotes/seller': handleGetSellerQuotes,
  '/api/v1/quotes/stats': handleGetSellerStats,
  '/api/v1/quotes/anonymous': handleGetAnonymousQuotes,
  '/api/v1/notifications/unread': handleGetUnreadNotifications,
  '/api/v1/credits/balance': handleGetCreditBalance,
  '/api/v1/credits/packages': handleGetCreditPackages,
}

const POST_ROUTES: Record<string, Handler> = {
  '/api/v1/onboarding/complete': handlePostCompleteOnboarding,
  '/api/v1/requests/create': handlePostCreateRequest,
  '/api/v1/requests/cancel': handlePostCancelRequest,
  '/api/v1/requests/reopen': handlePostReopenRequest,
  '/api/v1/requests/delete': handlePostDeleteRequest,
  '/api/v1/requests/update': handlePostUpdateRequest,
  '/api/v1/requests/fulfill': handlePostFulfillRequest,
  '/api/v1/quotes/create': handlePostCreateQuote,
  '/api/v1/quotes/update': handlePostUpdateQuote,
  '/api/v1/quotes/accept': handlePostAcceptQuote,
  '/api/v1/quotes/reject': handlePostRejectQuote,
  '/api/v1/quotes/revoke': handlePostRevokeQuote,
  '/api/v1/quotes/unreject': handlePostUnrejectQuote,
  '/api/v1/quotes/retract': handlePostRetractQuote,
  '/api/v1/quotes/remind': handlePostSendReminder,
  '/api/v1/notifications/read': handlePostMarkNotificationRead,
  '/api/v1/notifications/read-all': handlePostMarkAllNotificationsRead,
  '/api/v1/users/profile': handlePostUpdateProfile,
  '/api/v1/users/deactivate': handlePostDeactivateAccount,
  '/api/v1/users/delete': handlePostDeleteAccount,
  '/api/v1/credits/request': handlePostRequestCredits,
  '/api/v1/support/ticket': handlePostSupportTicket,
  '/api/v1/upload': handlePostUploadImage,
}

async function dispatch(
  routes: Record<string, Handler>,
  request: Request,
): Promise<Response> {
  const { pathname } = new URL(request.url)
  const handler = routes[pathname]
  if (!handler) return notFound(`No handler for ${request.method} ${pathname}`)
  try {
    return await handler(request)
  } catch (err: any) {
    console.error(`[API] ${request.method} ${pathname}:`, err?.message ?? err)
    return json({ error: err?.message ?? 'Internal Server Error' }, 500)
  }
}

// ─── Route export ─────────────────────────────────────────────

export const Route = createFileRoute('/api/v1/$')({
  server: {
    handlers: {
      GET: ({ request }) => dispatch(GET_ROUTES, request),
      POST: ({ request }) => dispatch(POST_ROUTES, request),
    },
  },
})
