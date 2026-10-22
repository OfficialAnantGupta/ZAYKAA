import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/auth/complete'

  // Only permit same-origin relative paths; backslashes can be interpreted as URL separators.
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    return NextResponse.redirect(new URL('/login?error=invalid_redirect', url.origin))
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, url.origin))
  }

  return NextResponse.redirect(new URL('/login?error=oauth_callback', url.origin))
}
