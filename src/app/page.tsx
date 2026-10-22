import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUpRight, Clock3, Leaf, MapPin, Search, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Restaurant = {
  id: string
  name: string
  slug: string
  description: string | null
  city: string | null
  cuisines: string[] | null
  logo_url: string | null
  cover_image_url: string | null
  min_order_value_paise: number | null
  delivery_time_min_minutes: number | null
  delivery_time_max_minutes: number | null
}

const imageFallbacks = [
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85',
]

async function getRestaurants(): Promise<Restaurant[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('id,name,slug,description,city,cuisines,logo_url,cover_image_url,min_order_value_paise,delivery_time_min_minutes,delivery_time_max_minutes')
      .eq('is_active', true)
      .eq('is_verified', true)
      .eq('is_demo', false)
      .order('name', { ascending: true })
      .limit(6)

    if (error) {
      console.error('Unable to load the public restaurant catalogue:', error.message)
      return []
    }
    return (data ?? []) as Restaurant[]
  } catch (error) {
    console.error('Restaurant catalogue unavailable:', error instanceof Error ? error.message : 'unknown error')
    return []
  }
}

function formatRupees(paise: number | null) {
  if (paise === null || !Number.isFinite(paise)) return null
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100)
}

function RestaurantCard({ restaurant, index }: { restaurant: Restaurant; index: number }) {
  const cover = restaurant.cover_image_url || imageFallbacks[index % imageFallbacks.length]
  const time = restaurant.delivery_time_min_minutes && restaurant.delivery_time_max_minutes
    ? `${restaurant.delivery_time_min_minutes}–${restaurant.delivery_time_max_minutes} min`
    : null

  return (
    <article className="restaurant-card">
      <Link href={`/restaurants/${restaurant.slug}`} className="restaurant-image" aria-label={`Explore ${restaurant.name}`}>
        <Image src={cover} alt={`${restaurant.name} restaurant cuisine`} fill sizes="(max-width: 680px) 88vw, (max-width: 1024px) 44vw, 360px" style={{ objectFit: 'cover' }} />
        <span className="image-index">0{index + 1}</span>
        <span className="image-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="restaurant-copy">
        <div className="restaurant-title-row"><h3 className="serif">{restaurant.name}</h3><span className="verified" title="Verified restaurant"><ShieldCheck size={15} /> Verified</span></div>
        <p>{restaurant.description?.trim() || (restaurant.cuisines ?? []).join(' · ') || 'A considered menu, made fresh for you.'}</p>
        <div className="restaurant-meta">
          {restaurant.city && <span><MapPin size={13} /> {restaurant.city}</span>}
          {time && <span><Clock3 size={13} /> {time}</span>}
          {restaurant.min_order_value_paise !== null && <span>Min. {formatRupees(restaurant.min_order_value_paise)}</span>}
        </div>
        <Link className="menu-link" href={`/restaurants/${restaurant.slug}`}>Explore menu <ArrowRight size={15} /></Link>
      </div>
    </article>
  )
}

export default async function HomePage() {
  const restaurants = await getRestaurants()
  return (
    <main>
      <div className="announcement"><Sparkles size={14} /><span>A finer way to discover the food you love</span><span className="announcement-divider">·</span><span>Thoughtfully local. Beautifully delivered.</span></div>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="wordmark" href="/" aria-label="ZAYKAA home"><span className="brand-mark"><UtensilsCrossed size={19} strokeWidth={1.7} /></span><span>ZAYKAA<small>THE ART OF GOOD TASTE</small></span></Link>
          <nav className="main-nav" aria-label="Main navigation"><a href="#discover">Discover</a><a href="#philosophy">Our philosophy</a><a href="#partners">For restaurants</a></nav>
          <div className="header-actions"><Link className="sign-in" href="/login">Sign in</Link><Link className="btn-primary header-cta" href="/login">Order beautifully <ArrowRight size={15} /></Link></div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-grain" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="gold-dot" /> THE TABLE, REIMAGINED</div>
            <h1 className="serif">Good taste is<br />a <em>way of life.</em></h1>
            <p className="hero-description">From cherished local kitchens to your table, discover a more personal, more beautiful way to enjoy the dishes worth savouring.</p>
            <form className="search-bar" action="/discover" method="get"><Search size={19} /><label className="sr-only" htmlFor="location-search">Search dishes or restaurants</label><input id="location-search" name="q" placeholder="A craving, a cuisine, a favourite…" /><button aria-label="Search restaurants" type="submit"><ArrowRight size={18} /></button></form>
            <div className="hero-trust"><span><ShieldCheck size={15} /> Curated & verified kitchens</span><span><Leaf size={15} /> Thoughtfully prepared</span></div>
            <a href="#discover" className="scroll-hint"><span className="scroll-line" /> A little inspiration <ArrowDown size={13} /></a>
          </div>
          <div className="hero-visual">
            <div className="hero-photo-main"><Image src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=90" alt="Beautifully plated fresh seasonal food" fill priority sizes="(max-width: 780px) 85vw, 45vw" style={{ objectFit: 'cover' }} /></div>
            <div className="hero-photo-small"><Image src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=85" alt="Rich, aromatic Indian cuisine served in a bowl" fill sizes="200px" style={{ objectFit: 'cover' }} /></div>
            <div className="hero-stamp"><span>MADE WITH</span><Sparkles size={19} /><span>INTENTION</span><span className="stamp-line" /></div>
            <div className="hero-note"><span className="note-star">✳</span><span><strong>Everyday, elevated.</strong><small>Little rituals. Lovely meals.</small></span></div>
          </div>
        </div>
        <div className="hero-bottom-rule" />
      </section>

      <section id="discover" className="discover-section section-pad">
        <div className="container">
          <div className="section-heading"><div><div className="eyebrow">YOUR NEXT FAVOURITE</div><h2 className="serif">A table worth <em>coming back to.</em></h2><p>Good kitchens. Honest ingredients. Food that makes an ordinary day feel special.</p></div><Link href="/discover" className="text-arrow">Discover all kitchens <ArrowUpRight size={17} /></Link></div>
          {restaurants.length > 0 ? <div className="restaurant-grid">{restaurants.map((restaurant, index) => <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />)}</div> : <div className="empty-catalog"><div className="empty-illustration"><UtensilsCrossed size={26} /></div><div className="eyebrow">A LITTLE PATIENCE, PLEASE</div><h3 className="serif">Something lovely is being prepared.</h3><p>Our verified restaurant collection is growing. Please return soon to discover kitchens worth knowing.</p><Link href="#partners" className="btn-secondary">Own a restaurant? Join ZAYKAA <ArrowRight size={15} /></Link></div>}
        </div>
      </section>

      <section id="philosophy" className="philosophy-section"><div className="container philosophy-grid"><div className="philosophy-photo"><Image src="https://images.unsplash.com/photo-1515003197210-e0cd7184f8b5?auto=format&fit=crop&w=1200&q=85" alt="Seasonal ingredients and a carefully prepared meal" fill sizes="(max-width: 760px) 90vw, 44vw" style={{ objectFit: 'cover' }} /><span className="photo-caption">A little care goes a long way.</span></div><div className="philosophy-copy"><div className="eyebrow">A NOTE ON GOOD TASTE</div><h2 className="serif">Not just delivered.<br /><em>Considered.</em></h2><p>We believe the best meals are never just about the food. They are about the people who make them, the ingredients they choose, and the small moments they create.</p><p>ZAYKAA brings thoughtful local restaurants a little closer to your everyday, with clear menus, trusted kitchens, and a more personal ordering experience.</p><div className="philosophy-signature"><span className="signature-icon">✳</span><span><strong>Made for the love of food.</strong><small>That is the ZAYKAA promise.</small></span></div></div></div></section>

      <section id="partners" className="partner-section"><div className="container partner-inner"><div><div className="eyebrow">FOR THE PEOPLE BEHIND THE PLATE</div><h2 className="serif">Your kitchen deserves<br /><em>a beautiful stage.</em></h2><p>Bring your restaurant to a community that appreciates the craft. Manage your menu, receive orders, and grow your presence from one simple workspace.</p><div className="partner-benefits"><span><ShieldCheck size={15} /> Verified listings</span><span><UtensilsCrossed size={15} /> Your menu, your way</span></div></div><div className="partner-action"><div className="partner-emblem"><UtensilsCrossed size={25} /></div><div className="eyebrow">LET'S MAKE SOMETHING GOOD</div><h3 className="serif">Join the ZAYKAA table.</h3><p>We're welcoming thoughtful restaurants to our growing community.</p><Link href="/restaurant/login" className="btn-primary">Restaurant owner sign in <ArrowRight size={16} /></Link><small>Already a partner? Use your Owner ID.</small></div></div></section>

      <footer className="site-footer"><div className="container footer-top"><Link className="wordmark footer-brand" href="/"><span className="brand-mark"><UtensilsCrossed size={18} /></span><span>ZAYKAA<small>THE ART OF GOOD TASTE</small></span></Link><p>A little more lovely, every day.</p><div className="footer-links"><Link href="/login">Customer sign in</Link><Link href="/restaurant/login">Restaurant portal</Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} ZAYKAA. Made with intention.</span><span>Rooted in good taste <span className="footer-flower">✳</span></span></div></footer>

      <style>{`
        .announcement{min-height:34px;background:var(--burgundy);color:#FAF6EF;display:flex;align-items:center;justify-content:center;gap:10px;font-size:11px;letter-spacing:.035em;padding:6px 14px;text-align:center}.announcement svg{color:#E8C98E}.announcement-divider{color:#D4AD69}
        .site-header{background:var(--ivory);border-bottom:1px solid rgba(185,138,60,.2);position:relative;z-index:5}.header-inner{height:88px;display:flex;align-items:center;justify-content:space-between;gap:25px}.wordmark{display:flex;align-items:center;gap:10px;color:var(--burgundy);font-family:Georgia,serif;font-size:23px;letter-spacing:.12em;font-weight:700;line-height:1}.wordmark small{display:block;font:700 8px Arial,sans-serif;letter-spacing:.18em;color:var(--muted);margin-top:6px}.brand-mark{display:grid;place-items:center;width:39px;height:39px;border:1px solid var(--gold);border-radius:50%;color:var(--gold)}.main-nav{display:flex;align-items:center;gap:30px;color:#66584C;font-size:12px}.main-nav a:hover,.sign-in:hover,.footer-links a:hover{color:var(--wine)}.header-actions{display:flex;align-items:center;gap:18px}.sign-in{font-size:12px;font-weight:700}.header-cta{min-height:40px;padding-inline:17px;font-size:11px}
        .hero{position:relative;overflow:hidden;background:radial-gradient(ellipse at 82% 25%,rgba(241,230,212,.72),transparent 40%),linear-gradient(115deg,#FAF6EF 0%,#FAF6EF 45%,#F6EDDF 100%);padding:63px 0 46px}.hero-grain{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(123,30,43,.05) .55px,transparent .55px);background-size:7px 7px;opacity:.48}.hero-grid{position:relative;display:grid;grid-template-columns:1fr .93fr;align-items:center;gap:65px}.hero-copy{padding:20px 0 32px}.gold-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--gold);margin-right:8px}.hero h1{font-size:clamp(56px,6.1vw,82px);line-height:.99;letter-spacing:-.045em;font-weight:400;margin:24px 0 21px;color:var(--espresso)}.hero h1 em,.section-heading h2 em,.philosophy-copy h2 em,.partner-inner h2 em{color:var(--burgundy);font-weight:400}.hero-description{max-width:445px;font-size:15px;line-height:1.85;color:#75675B;margin:0 0 27px}.search-bar{display:flex;align-items:center;gap:12px;max-width:472px;min-height:60px;padding:7px 8px 7px 17px;background:#fffdf9;border:1px solid #E6D9C6;border-radius:7px;box-shadow:0 12px 30px rgba(58,46,37,.06)}.search-bar>svg{color:var(--gold);flex-shrink:0}.search-bar input{border:0;outline:0;min-width:0;flex:1;background:transparent;color:var(--espresso);font-size:12px}.search-bar input::placeholder{color:#A0968A}.search-bar button{border:0;width:43px;height:43px;border-radius:4px;background:var(--wine);color:white;display:grid;place-items:center;cursor:pointer}.hero-trust{display:flex;gap:19px;flex-wrap:wrap;margin-top:19px;color:#786D62;font-size:10px}.hero-trust span{display:flex;align-items:center;gap:6px}.hero-trust svg{color:var(--sage)}.scroll-hint{display:flex;align-items:center;gap:9px;color:#7C7066;font-size:10px;margin-top:49px}.scroll-line{width:29px;height:1px;background:var(--gold)}
        .hero-visual{height:490px;position:relative;max-width:550px;width:100%;justify-self:end}.hero-photo-main{position:absolute;right:23px;top:0;width:78%;height:83%;border-radius:190px 190px 7px 7px;overflow:hidden;box-shadow:0 23px 55px rgba(58,46,37,.15)}.hero-photo-main:after{content:'';position:absolute;inset:0;border:1px solid rgba(255,255,255,.35);border-radius:inherit;pointer-events:none}.hero-photo-small{position:absolute;bottom:0;left:0;width:43%;height:43%;border:7px solid var(--ivory);border-radius:100px 100px 7px 7px;overflow:hidden;box-shadow:0 16px 35px rgba(58,46,37,.14)}.hero-stamp{position:absolute;right:0;top:28px;width:79px;height:104px;background:var(--wine);color:#FFF5E8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border-radius:48px 48px 4px 4px;box-shadow:0 10px 24px rgba(123,30,43,.19);font-size:7px;letter-spacing:.14em}.hero-stamp svg{color:#E5C184}.stamp-line{height:1px;width:24px;background:#D7B270}.hero-note{position:absolute;right:0;bottom:28px;display:flex;align-items:center;gap:10px;padding:14px 16px;background:var(--ivory);border:1px solid #E8D8C0;box-shadow:0 15px 35px rgba(58,46,37,.1);border-radius:5px}.note-star{color:var(--gold);font-size:24px}.hero-note strong,.hero-note small{display:block}.hero-note strong{font:italic 14px Georgia,serif;color:var(--burgundy)}.hero-note small{font-size:9px;color:#82776C;margin-top:5px}.hero-bottom-rule{position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#D6BC8B,transparent)}
        .section-pad{padding:94px 0 100px}.discover-section{background:#FDFBF7}.section-heading{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:34px}.section-heading h2,.philosophy-copy h2,.partner-inner h2{font-weight:400;font-size:clamp(34px,4vw,48px);letter-spacing:-.03em;line-height:1.13;margin:14px 0 12px}.section-heading p{font-size:13px;color:#817568;margin:0;line-height:1.65}.text-arrow,.menu-link{display:inline-flex;align-items:center;gap:7px;color:var(--burgundy);font-size:12px;font-weight:700;white-space:nowrap}.text-arrow{padding-bottom:6px}.restaurant-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.restaurant-card{min-width:0;border:1px solid #E9DFD0;background:#fffdfa;transition:transform .22s ease,box-shadow .22s ease}.restaurant-card:hover{transform:translateY(-4px);box-shadow:0 18px 35px rgba(58,46,37,.08)}.restaurant-image{position:relative;display:block;height:238px;overflow:hidden;background:var(--champagne)}.restaurant-image img{transition:transform .4s ease}.restaurant-card:hover .restaurant-image img{transform:scale(1.035)}.image-index{position:absolute;left:13px;top:13px;display:grid;place-items:center;width:33px;height:33px;border-radius:50%;background:rgba(250,246,239,.94);color:var(--burgundy);font:italic 12px Georgia,serif}.image-arrow{position:absolute;right:13px;bottom:13px;display:grid;place-items:center;width:35px;height:35px;border-radius:50%;background:var(--ivory);color:var(--burgundy)}.restaurant-copy{padding:19px 19px 20px}.restaurant-title-row{display:flex;align-items:center;justify-content:space-between;gap:8px}.restaurant-title-row h3{font-size:23px;font-weight:400;margin:0;letter-spacing:-.02em}.verified{display:flex;align-items:center;gap:4px;color:var(--sage);font-size:9px;white-space:nowrap}.restaurant-copy>p{font-size:11px;line-height:1.6;color:#87796C;min-height:34px;margin:11px 0 15px}.restaurant-meta{display:flex;align-items:center;flex-wrap:wrap;gap:9px;color:#73685D;font-size:10px;padding-bottom:16px;border-bottom:1px solid #EFE6D9}.restaurant-meta span{display:flex;align-items:center;gap:4px}.restaurant-meta svg{color:var(--gold)}.menu-link{margin-top:15px}.empty-catalog{text-align:center;border:1px solid #E8DCC9;background:linear-gradient(135deg,#FCF8F0,#F5EBDD);padding:52px 20px 47px;max-width:720px;margin:0 auto}.empty-illustration{width:57px;height:57px;border:1px solid var(--gold);border-radius:50%;margin:0 auto 20px;display:grid;place-items:center;color:var(--burgundy)}.empty-catalog h3{font-weight:400;font-size:29px;margin:12px 0}.empty-catalog p{max-width:425px;margin:0 auto 22px;color:#7F7367;font-size:12px;line-height:1.8}.empty-catalog .btn-secondary{background:rgba(255,255,255,.55)}
        .philosophy-section{padding:89px 0;background:var(--champagne)}.philosophy-grid{display:grid;grid-template-columns:1fr 1fr;gap:90px;align-items:center}.philosophy-photo{height:450px;position:relative;overflow:hidden;border-radius:170px 170px 5px 5px;box-shadow:0 18px 35px rgba(58,46,37,.11)}.photo-caption{position:absolute;bottom:16px;left:16px;padding:11px 14px;background:rgba(250,246,239,.93);font:italic 13px Georgia,serif;color:var(--burgundy)}.philosophy-copy{max-width:465px}.philosophy-copy h2{font-size:clamp(42px,4.4vw,57px);margin:18px 0 20px}.philosophy-copy>p,.partner-inner>div:first-child>p{font-size:13px;line-height:1.9;color:#706257;margin:0 0 14px}.philosophy-signature{display:flex;align-items:center;gap:12px;border-top:1px solid #D9C7AA;margin-top:29px;padding-top:23px}.signature-icon{font-size:29px;color:var(--gold)}.philosophy-signature strong,.philosophy-signature small{display:block}.philosophy-signature strong{font:italic 16px Georgia,serif;color:var(--burgundy)}.philosophy-signature small{font-size:10px;color:#817568;margin-top:5px}
        .partner-section{padding:87px 0;background:#FDFBF7}.partner-inner{display:grid;grid-template-columns:1.08fr .8fr;gap:95px;align-items:center}.partner-inner h2{font-size:clamp(40px,4.3vw,54px);margin:16px 0 18px}.partner-inner>div:first-child>p{max-width:495px}.partner-benefits{display:flex;gap:23px;flex-wrap:wrap;margin-top:22px;color:#71665A;font-size:11px}.partner-benefits span{display:flex;align-items:center;gap:7px}.partner-benefits svg{color:var(--sage)}.partner-action{background:var(--ivory);border:1px solid #E7D8C0;text-align:center;padding:35px 25px 29px;box-shadow:0 18px 42px rgba(58,46,37,.055)}.partner-emblem{display:grid;place-items:center;margin:0 auto 18px;width:57px;height:57px;border:1px solid var(--gold);border-radius:50%;color:var(--burgundy)}.partner-action h3{font-size:28px;font-weight:400;margin:12px 0 10px}.partner-action>p{color:#807468;font-size:11px;line-height:1.7;max-width:295px;margin:0 auto 20px}.partner-action .btn-primary{min-height:43px;font-size:11px}.partner-action>small{display:block;margin-top:14px;color:#8E8175;font-size:10px}
        .site-footer{background:#EFE3D1;padding:28px 0 17px;border-top:1px solid #E1CFB3}.footer-top{display:flex;align-items:center;justify-content:space-between;gap:25px;padding-bottom:23px}.footer-brand{font-size:20px}.footer-brand .brand-mark{width:35px;height:35px}.footer-top>p{font:italic 14px Georgia,serif;color:#78695B}.footer-links{display:flex;gap:20px;color:#66594D;font-size:11px}.footer-bottom{display:flex;justify-content:space-between;gap:16px;border-top:1px solid #DCC7A9;padding-top:15px;color:#827365;font-size:9px}.footer-flower{color:var(--gold);margin-left:5px}
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        @media(max-width:900px){.main-nav{gap:16px}.hero-grid{gap:30px}.hero-visual{height:420px}.hero-note{right:-8px}.restaurant-grid{gap:16px}.restaurant-image{height:205px}.restaurant-copy{padding:15px}.restaurant-title-row h3{font-size:20px}.philosophy-grid{gap:45px}.philosophy-photo{height:390px}.partner-inner{gap:45px}}
        @media(max-width:680px){.container{width:min(100% - 30px,520px)}.announcement{font-size:9px;gap:7px;flex-wrap:wrap}.announcement-divider{display:none}.header-inner{height:73px;gap:10px}.wordmark{font-size:20px;gap:7px}.wordmark small{font-size:7px}.brand-mark{width:34px;height:34px}.main-nav{display:none}.header-actions{gap:12px}.sign-in{font-size:11px}.header-cta{min-height:37px;padding-inline:12px;font-size:10px}.hero{padding:29px 0 31px}.hero-grid{grid-template-columns:1fr;gap:14px}.hero-copy{padding:18px 0 0}.hero h1{font-size:clamp(53px,14vw,72px);margin:17px 0 16px}.hero-description{font-size:13px;line-height:1.8;max-width:490px}.search-bar{min-height:55px}.search-bar input{font-size:11px}.hero-trust{gap:12px;font-size:9px}.scroll-hint{margin-top:24px}.hero-visual{height:340px;width:min(100%,430px);justify-self:center;margin-top:4px}.hero-photo-main{right:21px;width:75%;height:86%}.hero-photo-small{height:42%;width:42%;border-width:5px}.hero-stamp{height:88px;width:68px;top:18px;font-size:6px}.hero-note{right:-1px;bottom:16px;padding:10px 11px}.hero-note strong{font-size:12px}.hero-note small{font-size:8px}.section-pad{padding:61px 0 67px}.section-heading{display:block;margin-bottom:24px}.section-heading h2{font-size:37px;margin:12px 0}.section-heading p{font-size:12px}.section-heading .text-arrow{margin-top:17px}.restaurant-grid{grid-template-columns:1fr;gap:19px;max-width:490px;margin:auto}.restaurant-image{height:250px}.restaurant-copy{padding:17px}.restaurant-copy>p{min-height:0}.restaurant-title-row h3{font-size:24px}.empty-catalog{padding:35px 17px}.empty-catalog h3{font-size:26px}.philosophy-section{padding:58px 0}.philosophy-grid{grid-template-columns:1fr;gap:29px}.philosophy-photo{height:320px;width:100%;border-radius:130px 130px 5px 5px}.philosophy-copy h2{font-size:45px}.philosophy-copy>p{font-size:12px}.partner-section{padding:59px 0}.partner-inner{grid-template-columns:1fr;gap:29px}.partner-inner h2{font-size:43px}.partner-inner>div:first-child>p{font-size:12px}.partner-action{padding:29px 18px}.footer-top{flex-wrap:wrap;justify-content:space-between;gap:16px}.footer-top>p{display:none}.footer-links{gap:13px;font-size:10px}.footer-bottom{font-size:8px;flex-wrap:wrap}.footer-bottom span:last-child{display:none}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
      `}</style>
    </main>
  )
}
