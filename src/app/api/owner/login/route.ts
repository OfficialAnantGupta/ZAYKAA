import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ownerId?: unknown; password?: unknown }
    const ownerId = typeof body.ownerId === 'string' ? body.ownerId.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!ownerId || !password || ownerId.length > 120 || password.length > 1024) {
      return NextResponse.json({ error: 'Enter your Owner ID and password.' }, { status: 400 })
    }

    // The elevated client is used only to resolve the private Owner ID mapping.
    // It never signs in as the owner and is never bundled into browser code.
    const admin = createAdminClient()
    const { data: owner, error: lookupError } = await admin
      .from('restaurant_owner_accounts')
      .select('contact_email,status')
      .eq('owner_login_id', ownerId)
      .maybeSingle()

    // Deliberately use the same response for unknown, disabled and invalid credentials.
    if (lookupError || !owner || owner.status !== 'active' || !owner.contact_email) {
      return NextResponse.json({ error: 'Owner ID or password is incorrect, or this account is not active.' }, { status: 401 })
    }

    const supabase = await createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: owner.contact_email,
      password,
    })

    if (signInError) {
      return NextResponse.json({ error: 'Owner ID or password is incorrect, or this account is not active.' }, { status: 401 })
    }

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Unable to establish a secure session. Please try again.' }, { status: 401 })
    }

    const { data: roleRows, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'restaurant_owner')
      .limit(1)

    if (roleError || !roleRows?.length) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'This account has not been provisioned for the restaurant portal.' }, { status: 403 })
    }

    return NextResponse.json({ ok: true, redirectTo: '/auth/complete?next=%2Frestaurant/dashboard' })
  } catch {
    return NextResponse.json({ error: 'Restaurant sign-in is temporarily unavailable.' }, { status: 500 })
  }
}
