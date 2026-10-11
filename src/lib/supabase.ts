import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

/**
 * Browser Supabase client, created once. Returns null on the server and when the
 * two public settings are missing, so the site still loads without them.
 * Only the project URL and the publishable key belong here. Never the secret key.
 */
export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null
  if (client !== undefined) return client
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  client = url && key ? createClient(url, key) : null
  return client
}
