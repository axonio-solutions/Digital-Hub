import * as SecureStore from 'expo-secure-store'
import { apiUrl } from './server-fn'
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
const AUTH_ORIGIN = API_BASE_URL || 'http://localhost:5173'

export type ServerFnMethod = 'GET' | 'POST'

export interface FetchApiOptions<TPayload = unknown> {
  method?: ServerFnMethod
  payload?: TPayload
  signal?: AbortSignal
}

async function fetchApi<TResult, TPayload = unknown>(
  path: string,
  options: FetchApiOptions<TPayload> = {},
): Promise<TResult> {
  const { method = 'POST', payload, signal } = options

  const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY)

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Origin: AUTH_ORIGIN,
  }

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Cookie'] = `${AUTH_COOKIE_NAME}=${token}`
    headers['Authorization'] = `Bearer ${token}`
  }

  let finalUrl = `${API_BASE_URL}${path}`
  let body: string | undefined

  if (method === 'GET') {
    if (payload !== undefined) {
      finalUrl += `?payload=${encodeURIComponent(JSON.stringify(payload))}`
    }
  } else if (payload !== undefined) {
    body = JSON.stringify(payload)
  }

  if (__DEV__) console.log(`\n🌐 API ${method}: ${finalUrl}\n`)

  const res = await fetch(finalUrl, { method, headers, body, signal })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = `API ${method} ${path} failed: ${res.status} ${res.statusText}`
    try {
      const parsed = JSON.parse(text)
      if (parsed?.error) message = parsed.error
    } catch {
      if (text) message += ` ${text}`
    }
    throw new Error(message.trim())
  }

  const rawText = await res.text()
  if (!rawText) {
    return undefined as TResult
  }
  return JSON.parse(rawText) as TResult
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
  return fetchApi<CompleteOnboardingResult>(apiUrl('completeOnboarding'), {
    method: 'POST',
    payload: data,
  })
}

export async function fetchBuyerRequests(): Promise<Array<BuyerRequestRow>> {
  const result = await fetchApi<{
    success: boolean
    data: Array<BuyerRequestRow>
  }>(apiUrl('fetchBuyerRequests'), { method: 'GET' })
  return result?.data ?? []
}

export async function fetchRequestDetails(
  requestId: string,
): Promise<BuyerRequestRow | null> {
  const result = await fetchApi<{
    success: boolean
    data: BuyerRequestRow | null
  }>(apiUrl('fetchRequestDetails'), { method: 'GET', payload: requestId })
  return result?.data ?? null
}

export async function cancelRequestFn(requestId: string): Promise<void> {
  await fetchApi(apiUrl('cancelRequest'), {
    method: 'POST',
    payload: requestId,
  })
}

export async function reopenRequestFn(requestId: string): Promise<void> {
  await fetchApi(apiUrl('reopenRequest'), {
    method: 'POST',
    payload: requestId,
  })
}

export async function deleteRequestFn(requestId: string): Promise<void> {
  await fetchApi(apiUrl('deleteRequest'), {
    method: 'POST',
    payload: requestId,
  })
}

export async function acceptQuoteFn(quoteId: string): Promise<void> {
  await fetchApi(apiUrl('acceptQuote'), {
    method: 'POST',
    payload: { quoteId },
  })
}

export async function rejectQuoteFn(quoteId: string): Promise<void> {
  await fetchApi(apiUrl('rejectQuote'), {
    method: 'POST',
    payload: { quoteId },
  })
}

export async function revokeQuoteFn(quoteId: string): Promise<void> {
  await fetchApi(apiUrl('revokeQuote'), {
    method: 'POST',
    payload: { quoteId },
  })
}

export async function unrejectQuoteFn(quoteId: string): Promise<void> {
  await fetchApi(apiUrl('unrejectQuote'), {
    method: 'POST',
    payload: { quoteId },
  })
}

export async function fulfillRequestFn(requestId: string): Promise<void> {
  await fetchApi(apiUrl('fulfillRequest'), {
    method: 'POST',
    payload: requestId,
  })
}

export async function retractQuoteFn(quoteId: string): Promise<void> {
  await fetchApi(apiUrl('retractQuote'), {
    method: 'POST',
    payload: { id: quoteId },
  })
}

export async function sendReminderFn(quoteId: string): Promise<void> {
  await fetchApi(apiUrl('sendReminder'), {
    method: 'POST',
    payload: { quoteId },
  })
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
  return fetchApi(apiUrl('createRequest'), {
    method: 'POST',
    payload: { buyerId, ...data },
  })
}

export async function updateRequestFn(
  id: string,
  data: Partial<CreateRequestPayload>,
): Promise<{ success: boolean; data?: any; error?: string }> {
  return fetchApi(apiUrl('updateRequest'), {
    method: 'POST',
    payload: { id, payload: data },
  })
}

export async function getPublicTaxonomyFn(): Promise<PublicTaxonomyResult> {
  const result = await fetchApi<{
    success: boolean
    data: PublicTaxonomyResult
  }>(apiUrl('getPublicTaxonomy'), { method: 'GET' })
  return result?.data ?? { categories: [], brands: [] }
}

export async function fetchUnreadNotifications(): Promise<Array<Notification>> {
  const result = await fetchApi<
    { items: Array<Notification>; total: number } | Array<Notification>
  >(apiUrl('fetchUnreadNotifications'), { method: 'GET' })
  if (Array.isArray(result)) return result
  if (result && typeof result === 'object' && 'items' in result)
    return result.items ?? []
  return []
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  await fetchApi(apiUrl('markNotificationRead'), {
    method: 'POST',
    payload: notificationId,
  })
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetchApi(apiUrl('markAllNotificationsRead'), {
    method: 'POST',
    payload: {},
  })
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
  await fetchApi(apiUrl('updateProfile'), {
    method: 'POST',
    payload: { userId, updates },
  })
}

export async function deactivateAccountFn(userId: string): Promise<void> {
  await fetchApi(apiUrl('deactivateAccount'), {
    method: 'POST',
    payload: { userId },
  })
}

export async function deleteAccountFn(userId: string): Promise<void> {
  await fetchApi(apiUrl('deleteAccount'), {
    method: 'POST',
    payload: { userId },
  })
}

export interface SupportTicketInput {
  subject: string
  category: string
  message: string
}

export async function submitSupportTicketFn(
  data: SupportTicketInput,
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  return fetchApi(apiUrl('submitSupportTicket'), {
    method: 'POST',
    payload: data,
  })
}

// ── Seller API ────────────────────────────────────────────────

export async function fetchOpenRequests(
  filters?: OpenRequestFilters,
): Promise<Array<OpenRequestRow>> {
  const result = await fetchApi<
    { success: boolean; data: Array<OpenRequestRow> } | Array<OpenRequestRow>
  >(apiUrl('fetchOpenRequests'), {
    method: 'GET',
    ...(filters ? { payload: filters } : {}),
  })
  if (Array.isArray(result)) return result
  if (result && 'data' in result) return result.data ?? []
  return []
}

export async function fetchSellerQuotes(): Promise<Array<SellerQuote>> {
  const result = await fetchApi<Array<SellerQuote>>(apiUrl('getSellerQuotes'), {
    method: 'GET',
  })
  if (Array.isArray(result)) return result
  if (result && typeof result === 'object' && 'data' in result) {
    const data = (result as any).data
    return Array.isArray(data) ? data : []
  }
  return []
}

export async function fetchSellerDashboardStats(): Promise<SellerDashboardData | null> {
  const result = await fetchApi<SellerDashboardData>(
    apiUrl('fetchSellerStats'),
    { method: 'GET' },
  )
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
  const res = await fetchApi<{ success: boolean; error?: string }>(
    apiUrl('createQuote'),
    { method: 'POST', payload: data },
  )
  if (res && !res.success) {
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
  const res = await fetchApi<{ success: boolean; error?: string }>(
    apiUrl('updateQuote'),
    { method: 'POST', payload: { id: quoteId, data } },
  )
  if (res && !res.success) {
    throw new Error(res.error || 'Failed to update quote')
  }
}

export async function fetchCreditBalance(): Promise<CreditBalance | null> {
  const result = await fetchApi<CreditBalance>(apiUrl('getMyCreditBalance'), {
    method: 'GET',
  })
  return result ?? null
}

export async function fetchActiveCreditPackagesFn(): Promise<
  Array<CreditPackage>
> {
  return fetchApi<Array<CreditPackage>>(apiUrl('getActiveCreditPackages'), {
    method: 'GET',
  })
}

export async function requestCreditsFn(
  credits: number,
  packageId?: string,
): Promise<{ success: boolean; error?: string }> {
  return fetchApi(apiUrl('requestCredits'), {
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
      // ignore
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

  const result = await fetchApi<any>(apiUrl('getUser'), { method: 'GET' })

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

  if (
    result.accountStatus !== undefined &&
    result.account_status === undefined
  ) {
    result.account_status = result.accountStatus
  }

  return result as SessionUser
}

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
