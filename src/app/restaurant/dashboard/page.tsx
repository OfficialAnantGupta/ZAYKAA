import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, ClipboardList, UtensilsCrossed } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function money(paise: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(paise / 100)
}

export default async function RestaurantDashboardPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect('/restaurant/login')

  const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', auth.user.id)
  if (!roles?.some((row) => row.role === 'restaurant_owner' || row.role === 'admin')) redirect('/auth/complete')

  const { data: owner } = await supabase.from('restaurant_owner_accounts').select('restaurant_id,status,owner_login_id').eq('user_id', auth.user.id).maybeSingle()
  if (!owner || owner.status !== 'active') redirect('/restaurant/login?error=account_inactive')

  const [{ data: restaurant }, { data: orders, error: ordersError }, { data: subscription }] = await Promise.all([
    supabase.from('restaurants').select('name,city').eq('id', owner.restaurant_id).maybeSingle(),
    supabase.from('orders').select('id,order_number,status,total_paise,payment_method,payment_status,created_at').eq('restaurant_id', owner.restaurant_id).order('created_at', { ascending: false }).limit(8),
    supabase.from('restaurant_subscriptions').select('status,expires_at,subscription_plans(name)').eq('restaurant_id', owner.restaurant_id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  return (
    <main className="partner-dashboard">
      <header className="partner-dash-header"><Link href="/" className="wordmark"><span className="brand-mark"><UtensilsCrossed size={18} /></span><span>ZAYKAA<small>PARTNER WORKSPACE</small></span></Link><form action="/auth/signout" method="post"><button type="submit" className="partner-signout">Sign out</button></form></header>
      <section className="partner-dash-content">
        <div className="eyebrow">RESTAURANT PARTNER</div>
        <h1 className="serif">{restaurant?.name ?? 'Your kitchen'} <em>workspace.</em></h1>
        <p className="partner-dash-intro">{restaurant?.city ? `${restaurant.city} · ` : ''}Signed in with Owner ID <strong>{owner.owner_login_id}</strong>. Only your restaurant's records are shown.</p>
        <div className="partner-dash-summary"><article><span>Recent orders</span><strong>{ordersError ? '—' : orders?.length ?? 0}</strong><small>Latest 8 order records</small></article><article><span>Subscription</span><strong className="status-word">{subscription?.status ?? 'Not set'}</strong><small>{subscription?.expires_at ? `Until ${new Date(subscription.expires_at).toLocaleDateString('en-IN')}` : 'No expiry recorded'}</small></article></div>
        <section className="partner-orders"><div className="partner-orders-heading"><div><div className="eyebrow">SERVICE IN MOTION</div><h2 className="serif">Recent orders</h2></div><ClipboardList size={22} /></div>
          {ordersError ? <p className="partner-empty">Order records are not available yet. Apply the commerce migration and refresh.</p> : !orders?.length ? <p className="partner-empty">No orders yet. New customer orders will appear here when checkout is enabled.</p> : <div className="partner-order-list">{orders.map((order) => <article className="partner-order" key={order.id}><div><strong>{order.order_number}</strong><small>{new Date(order.created_at).toLocaleString('en-IN')}</small></div><span className={`partner-order-status status-${order.status}`}>{order.status.replaceAll('_', ' ')}</span><strong>{money(order.total_paise)}</strong></article>)}</div>}
        </section>
        <p className="partner-dash-footnote">Order status changes, menu editing, checkout validation and subscription billing are separate protected workflows; this page is the authenticated dashboard foundation.</p>
        <Link href="/" className="partner-home-link">Return to storefront <ArrowRight size={15} /></Link>
      </section>
      <style>{`.partner-dashboard{min-height:100svh;background:#FAF6EF}.partner-dash-header{min-height:82px;padding:0 max(24px,calc((100vw - 1100px)/2));display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E7DCCB}.partner-signout{border:1px solid #E0D2BE;border-radius:999px;padding:10px 17px;background:transparent;color:#7B1E2B;font-size:11px;font-weight:700;cursor:pointer}.partner-dash-content{width:min(1100px,calc(100% - 40px));margin:0 auto;padding:53px 0}.partner-dash-content h1{font-size:clamp(35px,5vw,55px);font-weight:400;margin:14px 0}.partner-dash-content h1 em{color:#7B1E2B;font-weight:400}.partner-dash-intro{font-size:12px;color:#796F65;line-height:1.8}.partner-dash-intro strong{color:#7B1E2B}.partner-dash-summary{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:29px 0}.partner-dash-summary article{display:flex;flex-direction:column;gap:9px;padding:23px;border:1px solid #E7DCCB;background:#FFFDFA}.partner-dash-summary article span{font-size:12px;color:#796F65}.partner-dash-summary article strong{font:400 34px Georgia,serif}.partner-dash-summary article small{font-size:10px;color:#998B7B}.partner-dash-summary article .status-word{font-size:23px;text-transform:capitalize}.partner-orders{border:1px solid #E7DCCB;background:#FFFDFA;padding:25px}.partner-orders-heading{display:flex;justify-content:space-between;align-items:center;color:#7B1E2B}.partner-orders-heading h2{font-size:29px;font-weight:400;margin:9px 0 20px;color:#3A2E25}.partner-empty{font-size:12px;line-height:1.8;color:#796F65;padding:15px 0}.partner-order-list{display:flex;flex-direction:column}.partner-order{display:grid;grid-template-columns:1fr 1fr auto;gap:15px;align-items:center;padding:15px 0;border-top:1px solid #EFE6D9}.partner-order>div strong,.partner-order>div small{display:block}.partner-order>div strong{font-size:12px}.partner-order>div small{font-size:10px;color:#998B7B;margin-top:5px}.partner-order>strong{font-size:12px}.partner-order-status{justify-self:start;background:#F3E9D8;border-radius:999px;padding:7px 10px;font-size:10px;text-transform:capitalize;color:#71582F}.status-delivered{background:#E5F0E7;color:#376B45}.status-cancelled,.status-rejected{background:#F8E6E3;color:#8B302A}.partner-dash-footnote{font-size:10px;line-height:1.8;color:#998B7B;margin-top:20px}.partner-home-link{display:inline-flex;align-items:center;gap:8px;margin-top:15px;color:#7B1E2B;font-size:11px;font-weight:700}@media(max-width:620px){.partner-dash-content{padding:35px 0}.partner-dash-summary{grid-template-columns:1fr}.partner-orders{padding:18px 14px}.partner-order{grid-template-columns:1fr auto;gap:8px}.partner-order-status{grid-column:1;grid-row:2}.partner-order>strong{grid-column:2;grid-row:1}.partner-dash-header{padding:0 18px}}`}</style>
    </main>
  )
}
