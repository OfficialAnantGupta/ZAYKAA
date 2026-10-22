import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/** Server-only elevated client. Never import this module into a Client Component. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Owner login is not configured. Set the server-only SUPABASE_SERVICE_ROLE_KEY.')
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
