import type { getUser } from '@/fn/auth'
import type { QueryClient } from '@tanstack/react-query'
import type { Session } from '@/lib/auth'

export interface MyRouterContext {
  queryClient: QueryClient
  user: Awaited<ReturnType<typeof getUser>>
  session: Session | null
}
