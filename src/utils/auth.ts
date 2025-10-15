// app/utils/auth.ts
import { getSupabaseServerClient } from '@/lib/supabaseServerClient'
import { createServerFn } from '@tanstack/react-start'

export const getSession = createServerFn().handler(async () => {
  const supabase = getSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
})
