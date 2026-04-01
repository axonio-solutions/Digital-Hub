import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Browser-side Supabase client for Realtime subscriptions
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
