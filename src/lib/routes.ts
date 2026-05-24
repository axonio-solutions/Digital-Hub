export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  EXPLORE: '/requests',
  FAQ: '/faq',
  PRICING: '/pricing',
} as const

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  COMPLETE_REGISTRATION: '/onboarding',
  WAITLIST: '/waitlist',
} as const

export const DASHBOARD_ROUTES = {
  ROOT: '/dashboard',
  PROFILE: '/dashboard/profile',
  SUPPORT: '/dashboard/support',
} as const

export const BUYER_ROUTES = {
  ROOT: '/buyer',
  REQUESTS: '/buyer/requests',
  REQUEST_DETAIL: (id: string) => `/buyer/requests/${id}`,
  REQUEST_DETAIL_PATTERN: '/buyer/requests/$requestId',
} as const

export const SELLER_ROUTES = {
  ROOT: '/seller',
  QUOTES: '/seller/quotes',
  BILLING: '/seller/billing',
  MARKETPLACE_REQUEST: (id: string) => `/requests/${id}`,
  MARKETPLACE_REQUEST_PATTERN: '/requests/$requestId',
} as const

export const ADMIN_ROUTES = {
  ROOT: '/admin',
  BUYERS: '/admin/buyers',
  SELLERS: '/admin/sellers',
  CATEGORIES: '/admin/categories',
  INTELLIGENCE: '/admin/intelligence',
  USERS: '/admin/users',
  REVENUE: '/admin/revenue',
  CREDIT_REQUESTS: '/admin/credit-requests',
  AUDIT_LOG: '/admin/audit-log',
} as const

export const SYSTEM_ROUTES = {
  OFFLINE: '/offline',
} as const

export const ROLE_HOME = {
  buyer: BUYER_ROUTES.REQUESTS,
  seller: SELLER_ROUTES.QUOTES,
  admin: DASHBOARD_ROUTES.ROOT,
} as const
