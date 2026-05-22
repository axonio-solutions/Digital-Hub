import * as SecureStore from 'expo-secure-store'
import { SERVER_FNS, serverFnUrl } from './server-fn'
import { deserializeResponse, serializeRequestPayload } from './seroval-client'
import type { BuyerRequestRow } from '../types/buyer'
import type { Notification } from '../types/notification'
import type { PublicTaxonomyResult } from '../types/taxonomy'
import type {
  CreditBalance,
  CreditPackage,
  OpenRequestFilters,
  OpenRequestRow,
  SellerDashboardData,
  SellerQuote,
} from '../types/seller'

const TOKEN_STORAGE_KEY = 'auth_session_token'
const AUTH_COOKIE_NAME = 'better-auth.session_token'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || ''

// Better Auth validates Origin against its baseURL (BETTER_AUTH_URL).
// Must match the server's BETTER_AUTH_URL env var, NOT the API target.
const AUTH_ORIGIN = 'http://localhost:5173'

export type ServerFnMethod = 'GET' | 'POST'

export interface FetchServerFnOptions<TPayload = unknown> {
  method?: ServerFnMethod
  payload?: TPayload
  signal?: AbortSignal
}

export async function fetchServerFn<TResult, TPayload = unknown>(
  endpoint: string,
  options: FetchServerFnOptions<TPayload> = {},
): Promise<TResult> {
  const { method = 'POST', payload, signal } = options

  const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY)

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-tsr-serverfn': 'true',
    Origin: AUTH_ORIGIN,
  }

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Cookie'] = `${AUTH_COOKIE_NAME}=${token}`
    headers['Authorization'] = `Bearer ${token}`
  }

  // 🚨 NUCLEAR OPTION: Manually combine strings instead of using the URL object
  let finalUrl = `${API_BASE_URL}${endpoint}`
  let body: string | undefined

  if (method === 'GET') {
    if (payload !== undefined) {
      const serialized = await serializeRequestPayload(payload)
      finalUrl += `?payload=${encodeURIComponent(serialized)}`
    }
  } else if (payload !== undefined) {
    body = await serializeRequestPayload(payload)
  }

  if (__DEV__) console.log(`\n🚨 ATTEMPTING TO FETCH: ${finalUrl}\n`)

  const res = await fetch(finalUrl, { method, headers, body, signal })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `fetchServerFn ${method} ${endpoint} failed: ${res.status} ${res.statusText} ${text}`.trim(),
    )
  }
  const rawText = await res.text()

  if (!rawText) {
    throw new Error('Server returned an empty response.')
  }

  const deserialized: any = deserializeResponse(rawText)

  // The server serialises the full middleware context including `.result` and
  // `.error` fields. The official TanStack Start client unwraps `.result`
  // after all middlewares execute. We mirror that here so callers receive
  // just the handler's return value, or throw on error.
  const isCtx =
    deserialized && typeof deserialized === 'object' && 'result' in deserialized
  if (isCtx) {
    if (deserialized.error) {
      throw deserialized.error instanceof Error
        ? deserialized.error
        : new Error(deserialized.error?.message ?? String(deserialized.error))
    }
    return deserialized.result as TResult
  }
  if (__DEV__)
    console.log(
      '\n📦 fetchServerFn: no .result wrapper, returning raw. keys=',
      deserialized && typeof deserialized === 'object'
        ? Object.keys(deserialized).slice(0, 8)
        : typeof deserialized,
    )
  return deserialized as TResult
}

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token)
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_STORAGE_KEY)
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY)
}

export interface CompleteOnboardingInput {
  name: string
  email: string
  role: 'buyer' | 'seller'
  phoneNumber?: string
  whatsappNumber?: string
  storeName?: string
  wilaya?: string
  city?: string
  address?: string
  companyAddress?: string
  commercialRegister?: string
  brandIds?: Array<string>
  categoryIds?: Array<string>
}

export interface CompleteOnboardingResult {
  success: boolean
  account_status: string
}

export async function completeOnboarding(
  data: CompleteOnboardingInput,
): Promise<CompleteOnboardingResult> {
  const url = serverFnUrl(SERVER_FNS.completeOnboarding)
  return fetchServerFn<CompleteOnboardingResult>(url, {
    method: 'POST',
    payload: data,
  })
}

export async function fetchBuyerRequests(): Promise<Array<BuyerRequestRow>> {
  const url = serverFnUrl(SERVER_FNS.fetchBuyerRequests)
  const result = await fetchServerFn<{
    success: boolean
    data: Array<BuyerRequestRow>
  }>(url, { method: 'GET' })
  return result?.data ?? []
}

export async function fetchRequestDetails(
  requestId: string,
): Promise<BuyerRequestRow | null> {
  const url = serverFnUrl(SERVER_FNS.fetchRequestDetails)
  const result = await fetchServerFn<{
    success: boolean
    data: BuyerRequestRow | null
  }>(url, { method: 'GET', payload: requestId })
  return result?.data ?? null
}

export async function cancelRequestFn(requestId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.cancelRequest)
  await fetchServerFn(url, { method: 'POST', payload: requestId })
}

export async function reopenRequestFn(requestId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.reopenRequest)
  await fetchServerFn(url, { method: 'POST', payload: requestId })
}

export async function deleteRequestFn(requestId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.deleteRequest)
  await fetchServerFn(url, { method: 'POST', payload: requestId })
}

export async function acceptQuoteFn(quoteId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.acceptQuote)
  await fetchServerFn(url, { method: 'POST', payload: { quoteId } })
}

export async function rejectQuoteFn(quoteId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.rejectQuote)
  await fetchServerFn(url, { method: 'POST', payload: { quoteId } })
}

export async function revokeQuoteFn(quoteId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.revokeQuote)
  await fetchServerFn(url, { method: 'POST', payload: { quoteId } })
}

export async function unrejectQuoteFn(quoteId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.unrejectQuote)
  await fetchServerFn(url, { method: 'POST', payload: { quoteId } })
}

export async function fulfillRequestFn(requestId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.fulfillRequest)
  await fetchServerFn(url, { method: 'POST', payload: requestId })
}

export async function retractQuoteFn(quoteId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.retractQuote)
  await fetchServerFn(url, { method: 'POST', payload: { id: quoteId } })
}

export async function sendReminderFn(quoteId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.sendReminder)
  await fetchServerFn(url, { method: 'POST', payload: { quoteId } })
}

export interface CreateRequestPayload {
  partName: string
  notes?: string
  categoryId?: string
  brandId?: string
  vehicleBrand: string
  modelYear: string
  oemNumber?: string
  imageUrls?: Array<string>
}

export async function createRequestFn(
  buyerId: string,
  data: CreateRequestPayload,
): Promise<{ success: boolean; data?: any; error?: string }> {
  const url = serverFnUrl(SERVER_FNS.createRequest)
  return fetchServerFn(url, {
    method: 'POST',
    payload: { buyerId, ...data },
  })
}

export async function updateRequestFn(
  id: string,
  data: Partial<CreateRequestPayload>,
): Promise<{ success: boolean; data?: any; error?: string }> {
  const url = serverFnUrl(SERVER_FNS.updateRequest)
  return fetchServerFn(url, {
    method: 'POST',
    payload: { id, payload: data },
  })
}

export async function getPublicTaxonomyFn(): Promise<PublicTaxonomyResult> {
  const url = serverFnUrl(SERVER_FNS.getPublicTaxonomy)
  const result = await fetchServerFn<{
    success: boolean
    data: PublicTaxonomyResult
  }>(url, { method: 'GET' })
  return result?.data ?? { categories: [], brands: [] }
}

export async function fetchUnreadNotifications(): Promise<Array<Notification>> {
  const url = serverFnUrl(SERVER_FNS.fetchUnreadNotifications)
  const result = await fetchServerFn<
    { items: Array<Notification>; total: number } | Array<Notification>
  >(url, { method: 'GET' })
  if (Array.isArray(result)) return result
  if (result && typeof result === 'object' && 'items' in result)
    return result.items ?? []
  return []
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.markNotificationRead)
  await fetchServerFn(url, { method: 'POST', payload: notificationId })
}

export async function markAllNotificationsRead(): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.markAllNotificationsRead)
  await fetchServerFn(url, { method: 'POST', payload: {} })
}

export interface UpdateProfileInput {
  name?: string
  email?: string
  phoneNumber?: string
  whatsappNumber?: string
  address?: string
  city?: string
  wilaya?: string
  image?: string
  storeName?: string
  companyAddress?: string
  commercialRegister?: string
}

export async function updateProfileFn(
  userId: string,
  updates: UpdateProfileInput,
): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.updateProfile)
  await fetchServerFn(url, { method: 'POST', payload: { userId, updates } })
}

export async function deactivateAccountFn(userId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.deactivateAccount)
  await fetchServerFn(url, { method: 'POST', payload: { userId } })
}

export async function deleteAccountFn(userId: string): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.deleteAccount)
  await fetchServerFn(url, { method: 'POST', payload: { userId } })
}

export interface SupportTicketInput {
  subject: string
  category: string
  message: string
}

export async function submitSupportTicketFn(
  data: SupportTicketInput,
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  const url = serverFnUrl(SERVER_FNS.submitSupportTicket)
  return fetchServerFn(url, { method: 'POST', payload: data })
}

// ── Seller API ────────────────────────────────────────────────

export async function fetchOpenRequests(
  filters?: OpenRequestFilters,
): Promise<Array<OpenRequestRow>> {
  const url = serverFnUrl(SERVER_FNS.fetchOpenRequests)
  const result = await fetchServerFn<
    { success: boolean; data: Array<OpenRequestRow> } | Array<OpenRequestRow>
  >(url, {
    method: 'GET',
    ...(filters ? { payload: filters } : {}),
  })
  if (Array.isArray(result)) return result
  if (result && 'data' in result) return result.data ?? []
  return []
}

export async function fetchSellerQuotes(): Promise<Array<SellerQuote>> {
  const url = serverFnUrl(SERVER_FNS.getSellerQuotes)
  const result = await fetchServerFn<Array<SellerQuote>>(url, { method: 'GET' })
  if (Array.isArray(result)) return result
  if (result && typeof result === 'object' && 'data' in result) {
    const data = (result as any).data
    return Array.isArray(data) ? data : []
  }
  return []
}

export async function fetchSellerDashboardStats(): Promise<SellerDashboardData | null> {
  const url = serverFnUrl(SERVER_FNS.fetchSellerStats)
  const result = await fetchServerFn<SellerDashboardData>(url, {
    method: 'GET',
  })
  return result ?? null
}

export interface CreateQuotePayload {
  requestId: string
  sellerId: string
  price: number
  condition: 'new' | 'used'
  warranty?: string
}

export async function createQuoteFn(data: CreateQuotePayload): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.createQuote)
  const res = await fetchServerFn<{ success: boolean; error?: string }>(url, {
    method: 'POST',
    payload: data,
  })
  if (!res.success) {
    throw new Error(res.error || 'Failed to create quote')
  }
}

export interface UpdateQuotePayload {
  requestId: string
  sellerId: string
  price: number
  condition: 'new' | 'used'
  warranty?: string
}

export async function updateQuoteFn(
  quoteId: string,
  data: UpdateQuotePayload,
): Promise<void> {
  const url = serverFnUrl(SERVER_FNS.updateQuote)
  const res = await fetchServerFn<{ success: boolean; error?: string }>(url, {
    method: 'POST',
    payload: { id: quoteId, data },
  })
  if (!res.success) {
    throw new Error(res.error || 'Failed to update quote')
  }
}

export async function fetchCreditBalance(): Promise<CreditBalance | null> {
  const url = serverFnUrl(SERVER_FNS.getMyCreditBalance)
  const result = await fetchServerFn<CreditBalance>(url, { method: 'GET' })
  return result ?? null
}

export async function fetchActiveCreditPackagesFn(): Promise<
  Array<CreditPackage>
> {
  const url = serverFnUrl(SERVER_FNS.getActiveCreditPackages)
  return fetchServerFn<Array<CreditPackage>>(url, { method: 'GET' })
}

export async function requestCreditsFn(
  credits: number,
  packageId?: string,
): Promise<{ success: boolean; error?: string }> {
  const url = serverFnUrl(SERVER_FNS.requestCredits)
  return fetchServerFn(url, {
    method: 'POST',
    payload: { credits, packageId },
  })
}

// ── Auth ──────────────────────────────────────────────────────

export interface SignInResult {
  token: string
  user: Record<string, unknown> | null
}

interface AuthEndpointBody {
  email: string
  password: string
  name?: string
}

/**
 * Shared core for /api/auth/sign-in/email and /api/auth/sign-up/email.
 * Returns either a parsed body (success) or throws an Error tagged with the
 * Better Auth error code so callers can branch on USER_NOT_FOUND, etc.
 */
async function callAuthEndpoint(
  path: '/api/auth/sign-in/email' | '/api/auth/sign-up/email',
  body: AuthEndpointBody,
): Promise<{ token: string; user: Record<string, unknown> | null }> {
  const url = `${API_BASE_URL}${path}`
  if (__DEV__) console.log(`\n🔐 AUTH POST: ${url}\n`)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: AUTH_ORIGIN,
    },
    body: JSON.stringify(body),
  })

  const rawText = await res.text()
  if (__DEV__)
    console.log(`\n📦 AUTH RESPONSE (${res.status}):\n`, rawText, `\n`)

  let parsed: any = null
  if (rawText) {
    try {
      parsed = JSON.parse(rawText)
    } catch {
      // ignore — we'll fall back to status text below
    }
  }

  if (!res.ok) {
    const message =
      (parsed && (parsed.message || parsed.error?.message || parsed.error)) ||
      `${res.status} ${res.statusText}`
    const code: string | undefined =
      parsed && typeof parsed.code === 'string'
        ? parsed.code
        : parsed?.error?.code
    const err = new Error(
      typeof message === 'string' ? message : JSON.stringify(message),
    ) as Error & { code?: string; status?: number }
    err.code = code
    err.status = res.status
    throw err
  }

  const token =
    (parsed && typeof parsed.token === 'string' ? parsed.token : null) ??
    res.headers.get('set-auth-token') ??
    extractCookieValue(res.headers, AUTH_COOKIE_NAME)

  if (!token) {
    throw new Error(
      'Auth succeeded but no session token was returned. Checked: JSON body `.token`, `set-auth-token` header, and `Set-Cookie`.',
    )
  }

  await setAuthToken(token)
  if (__DEV__) console.log(`\n✅ TOKEN STORED (length=${token.length})\n`)

  return {
    token,
    user:
      parsed &&
      typeof parsed === 'object' &&
      parsed.user &&
      typeof parsed.user === 'object'
        ? (parsed.user as Record<string, unknown>)
        : null,
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<SignInResult> {
  return callAuthEndpoint('/api/auth/sign-in/email', { email, password })
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string,
): Promise<SignInResult> {
  return callAuthEndpoint('/api/auth/sign-up/email', {
    email,
    password,
    name: name ?? email.split('@')[0] ?? email,
  })
}

/**
 * Better Auth ships the session+user via /api/auth/get-session. We use it
 * after sign-in to read account_status (which the sign-in response does not
 * include) so the app can route to onboarding / waitlist / main.
 */
export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role?: string | null
  account_status?: 'new' | 'active' | 'waitlisted' | string | null
  image?: string | null
  phoneNumber?: string | null
  whatsappNumber?: string | null
  storeName?: string | null
  wilaya?: string | null
  city?: string | null
  address?: string | null
  companyAddress?: string | null
  commercialRegister?: string | null
  [key: string]: unknown
}

export async function fetchSession(): Promise<SessionUser | null> {
  const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY)
  if (!token) return null

  const url = serverFnUrl(SERVER_FNS.getUser)
  const result = await fetchServerFn<any>(url, { method: 'GET' })

  if (!result || typeof result !== 'object') return null

  if (__DEV__) {
    console.log('\n🔐 SESSION user keys:', Object.keys(result).slice(0, 15))
    console.log(
      '🔐 SESSION accountStatus:',
      result.accountStatus,
      'account_status:',
      result.account_status,
    )
  }

  // Drizzle's casing: "snake_case" config maps DB snake_case to TS
  // camelCase in query results (e.g. account_status → accountStatus).
  // Our SessionUser uses the snake_case `account_status`.
  if (
    result.accountStatus !== undefined &&
    result.account_status === undefined
  ) {
    result.account_status = result.accountStatus
  }

  return result as SessionUser
}

/**
 * Pulls a single cookie value out of a Set-Cookie response header.
 *
 * RN's fetch concatenates multiple Set-Cookie headers into one comma-joined
 * string. Cookie attribute values can also contain commas (e.g. Expires
 * dates), so we split only on commas that look like a cookie boundary —
 * `, name=` — and fall back to getSetCookie() when the runtime supports it.
 */
function extractCookieValue(headers: Headers, name: string): string | null {
  const maybeGetAll = (
    headers as Headers & {
      getSetCookie?: () => Array<string>
    }
  ).getSetCookie
  const cookieStrings: Array<string> =
    typeof maybeGetAll === 'function'
      ? maybeGetAll.call(headers)
      : (headers.get('set-cookie')?.split(/,(?=\s*[A-Za-z0-9_.-]+=)/) ?? [])

  for (const raw of cookieStrings) {
    const cookie = raw.trimStart()
    if (cookie.startsWith(`${name}=`)) {
      return cookie.slice(name.length + 1).split(';')[0] ?? null
    }
  }
  return null
}
