import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, customSession, phoneNumber } from 'better-auth/plugins'
import { db } from '@/db'
import * as schema from '@/db/schema'

// Debug logging for environment variables (Netlify deployment)
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  console.log('--- ENV DEBUG ---')
  console.log('BETTER_AUTH_URL:', process.env.BETTER_AUTH_URL || 'MISSING')
  console.log('VITE_APP_URL:', process.env.VITE_APP_URL || 'MISSING')
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'MISSING')
  console.log('DATABASE:', process.env.DATABASE_URL || 'MISSING')
  console.log('BETTER_AUTH_SECRET:', process.env.BETTER_AUTH_SECRET ? 'PRESENT' : 'MISSING')
  console.log('------------------')
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema,
    provider: 'pg',
    usePlural: true,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  logger: {
    level: 'error',
  },
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      account_status: {
        type: 'string',
        required: false,
        input: false,
      },
      phoneNumber: {
        type: 'string',
        required: false,
        input: true,
      },
      storeName: {
        type: 'string',
        required: false,
        input: true,
      },
      wilaya: {
        type: 'string',
        required: false,
        input: true,
      },
      whatsappNumber: {
        type: 'string',
        required: false,
        input: true,
      },
      address: {
        type: 'string',
        required: false,
        input: true,
      },
      city: {
        type: 'string',
        required: false,
        input: true,
      },
      companyAddress: {
        type: 'string',
        required: false,
        input: true,
      },
      commercialRegister: {
        type: 'string',
        required: false,
        input: true,
      },
      viewModeGeneralBroadcast: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: true,
      },
    },
  },
  plugins: [
    admin(),
    phoneNumber({
      signUpOnVerification: {
        getTempEmail: (phone) => `${phone.replace('+', '')}@mlila.temp`,
        getTempName: (phone) => `User ${phone}`,
      },
      sendOTP: async ({ phoneNumber, code }) => {
        console.log(`\n\n------------------------------`)
        console.log(`OTP for ${phoneNumber}: ${code}`)
        console.log(`------------------------------\n\n`)
      },
    }),
    customSession(async ({ user, session }) => {
      return {
        user,
        session,
      }
    }),
  ],
})

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
  role?: string | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: Date | null
  account_status?: string | null
  phoneNumber?: string | null
  phoneNumberVerified?: boolean | null
  storeName?: string | null
  companyAddress?: string | null
  commercialRegister?: string | null
  address?: string | null
  city?: string | null
  wilaya?: string | null
  whatsappNumber?: string | null
  preferredLanguage?: string | null
  isDeactivated?: boolean | null
  sellerBrands?: { brand: { id: string; brand: string } }[]
  sellerCategories?: { category: { id: string; name: string } }[]
  priorityScore?: number | null
  viewModeGeneralBroadcast?: boolean | null
}

export type Auth = typeof auth
export type Session = typeof auth.$Infer.Session.session
// Use the manually defined User interface for better DX and consistency
// export type User = typeof auth.$Infer.Session.user;
