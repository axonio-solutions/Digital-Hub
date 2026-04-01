import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, customSession, phoneNumber } from 'better-auth/plugins'
import { db } from '@/db'
import * as schema from '@/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema,
    provider: 'pg',
    usePlural: true,
  }),
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
