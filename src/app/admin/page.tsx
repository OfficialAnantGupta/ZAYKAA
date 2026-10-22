import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, ClipboardList, Store, WalletCards } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect('/login')

  const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', auth.user.id)
  if (!roles?.some((row) => row.role === 'admin')) redirect('/auth/complete')

  const [restaurants, orders, subscriptions] = await Promise.all([
    supabase.from('restaurants').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('restaurant_subscriptions').select('id', { count: 'exact', head: true }),
  ])

  const metrics = [
    { label: 'Restaurants', value: restaurants.count ?? '—', detail: 'Catalogue records', icon: Store },
    { label: 'Orders', value: orders.count ?? '—', detail: orders.error ? 'Apply commerce migration to enable' : 'Across the platform', icon: ClipboardList },
    { label: 'Subscriptions', value: subscriptions.count ?? '—', detail: subscriptions.error ? 'Apply commerce migration to enable' : 'Lifecycle records', icon: WalletCards },
  ]

  return (
    <main className="admin-shell">
      <header className="admin-header"><Link href="/" className="wordmark"><span className="brand-mark"><Store size={18} /></span><span>ZAYKAA<small>ADMINISTRATION</small></span></Link><form action="/auth/signout" method="post"><button className="admin-signout" type="submit">Sign out</button></form></header>
      <section className="admin-content">
        <div className="eyebrow">PLATFORM OVERVIEW</div>
        <h1 className="serif">Good morning, <em>Admin.</em></h1>
        <p className="admin-intro">Your operations overview. Role access is verified against Supabase, not browser state.</p>
        <div className="admin-metrics">{metrics.map(({ label, value, detail, icon: Icon }) => <article className="admin-metric" key={label}><span className="admin-metric-icon"><Icon size={18} /></span><span className="admin-metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></article>)}</div>
        <section className="admin-panel"><div><div className="eyebrow">NEXT STEPS</div><h2 className="serif">Build with confidence.</h2><p>Provision approved restaurant owners, review catalogue records and finish checkout/payment provider setup before accepting production orders.</p></div><Link href="/" className="btn-secondary">View storefront <ArrowRight size={15} /></Link></section>
        {(orders.error || subscriptions.error) && <p className="admin-notice">The new order/subscription tables are not yet available to this project session. Apply the migration in this pull request, then refresh.</p>}
      </section>
      <style>{`.admin-shell{min-height:100svh;background:#FAF6EF}.admin-header{min-height:84px;padding:0 max(24px,calc((100vw - 1120px)/2));display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E7DCCB}.admin-signout{border:1px solid #E0D2BE;border-radius:999px;padding:10px 17px;background:transparent;color:#7B1E2B;font-size:11px;font-weight:700;cursor:pointer}.admin-content{width:min(1120px,calc(100% - 40px));margin:0 auto;padding:58px 0}.admin-content h1{font-size:clamp(38px,5vw,58px);font-weight:400;margin:14px 0}.admin-content h1 em{color:#7B1E2B;font-weight:400}.admin-intro{font-size:13px;line-height:1.8;color:#796F65}.admin-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px;margin:32px 0}.admin-metric{background:#FFFDFA;border:1px solid #E7DCCB;padding:22px;display:flex;flex-direction:column;align-items:flex-start;gap:10px}.admin-metric-icon{width:38px;height:38px;border:1px solid #E3D2B6;border-radius:50%;display:grid;place-items:center;color:#7B1E2B}.admin-metric-label{font-size:12px;color:#796F65}.admin-metric strong{font:400 35px Georgia,serif;color:#3A2E25}.admin-metric small{font-size:10px;color:#998B7B}.admin-panel{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:26px;background:#F1E6D4;border:1px solid #E3D2B6}.admin-panel h2{font-size:27px;font-weight:400;margin:10px 0}.admin-panel p{font-size:12px;line-height:1.8;color:#796F65;max-width:650px;margin:0}.admin-notice{margin-top:20px;padding:13px;background:#FFF5E5;border:1px solid #E8D3AC;color:#765A2B;font-size:11px;line-height:1.7}@media(max-width:650px){.admin-content{padding:38px 0}.admin-metrics{grid-template-columns:1fr}.admin-panel{align-items:flex-start;flex-direction:column}.admin-header{padding:0 20px}}`}</style>
    </main>
  )
}
