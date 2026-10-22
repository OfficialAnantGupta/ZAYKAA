import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) return NextResponse.redirect(new URL('/login', url.origin))

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles').select('role').eq('user_id', authData.user.id)

  if (rolesError) return NextResponse.redirect(new URL('/login?error=role_lookup', url.origin))

  const roleNames = new Set((roles ?? []).map((row) => row.role))
  const requested = url.searchParams.get('next')
  const safeNext = requested?.startsWith('/') && !requested.startsWith('//') && !requested.includes('\\') ? requested : null

  if (roleNames.has('admin')) {
    return NextResponse.redirect(new URL(safeNext?.startsWith('/admin') ? safeNext : '/admin', url.origin))
  }
  if (roleNames.has('restaurant_owner')) {
    return NextResponse.redirect(new URL(safeNext?.startsWith('/restaurant') ? safeNext : '/restaurant/dashboard', url.origin))
  }

  // Customers authenticate with Google; no browser-provided role is trusted.
  if (authData.user.app_metadata?.provider === 'google' || roleNames.has('customer')) {
    return NextResponse.redirect(new URL(safeNext && !safeNext.startsWith('/admin') && !safeNext.startsWith('/restaurant') ? safeNext : '/discover', url.origin))
  }

  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login?error=role_missing', url.origin))
}
