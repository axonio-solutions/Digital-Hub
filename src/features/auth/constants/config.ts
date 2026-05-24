export { AUTH_ROUTES } from '@/lib/routes'

export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
