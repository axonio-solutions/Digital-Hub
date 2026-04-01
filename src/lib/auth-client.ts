import { createAuthClient } from 'better-auth/react'
import {
  customSessionClient,
  phoneNumberClient,
} from 'better-auth/client/plugins'
import type { auth } from './auth'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL || '',
  plugins: [customSessionClient<typeof auth>(), phoneNumberClient()],
})
