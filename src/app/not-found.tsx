import Link from 'next/link'
import { ArrowLeft, UtensilsCrossed } from 'lucide-react'

export default function NotFound() {
  return <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: '#FAF6EF', color: '#3A2E25', textAlign: 'center' }}><div style={{ maxWidth: 440 }}><div style={{ width: 60, height: 60, border: '1px solid #B98A3C', color: '#7B1E2B', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 22px' }}><UtensilsCrossed size={25} /></div><div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.2em', color: '#7B1E2B' }}>A LITTLE DETOUR</div><h1 style={{ fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: 42, lineHeight: 1.1, margin: '14px 0' }}>This table isn't here.</h1><p style={{ color: '#796F65', lineHeight: 1.8, fontSize: 14 }}>The page you are looking for may have moved. Let's find something lovely instead.</p><Link href="/" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 9, padding: '13px 20px', borderRadius: 999, background: '#8E2B3A', color: 'white', fontSize: 13 }}><ArrowLeft size={16} /> Return to ZAYKAA</Link></div></main>
}
