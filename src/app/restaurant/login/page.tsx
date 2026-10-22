'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, KeyRound, UtensilsCrossed } from 'lucide-react'

export default function RestaurantLoginPage() {
  const [ownerId, setOwnerId] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId, password }),
      })
      const result = await response.json() as { error?: string; redirectTo?: string }
      if (!response.ok || !result.redirectTo) throw new Error(result.error || 'Unable to sign in.')
      window.location.assign(result.redirectTo)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.')
      setBusy(false)
    }
  }

  return (
    <main className="owner-auth-shell">
      <Link href="/" className="owner-auth-back"><ArrowLeft size={15} /> Back to ZAYKAA</Link>
      <section className="owner-auth-card">
        <Link className="wordmark owner-auth-wordmark" href="/"><span className="brand-mark"><UtensilsCrossed size={19} /></span><span>ZAYKAA<small>THE ART OF GOOD TASTE</small></span></Link>
        <div className="owner-auth-icon"><KeyRound size={22} /></div>
        <div className="eyebrow owner-auth-eyebrow">THE RESTAURANT PARTNER PORTAL</div>
        <h1 className="serif">Welcome <em>back.</em></h1>
        <p className="owner-auth-intro">Your kitchen, your menu, your orders. Sign in with the unique Owner ID issued by ZAYKAA administration.</p>
        <form onSubmit={submit} className="owner-auth-form">
          <label htmlFor="owner-id">Owner ID</label>
          <input id="owner-id" value={ownerId} onChange={(event) => setOwnerId(event.target.value)} autoComplete="username" required maxLength={120} placeholder="Enter your assigned Owner ID" />
          <label htmlFor="owner-password">Password</label>
          <input id="owner-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required maxLength={1024} placeholder="Enter your password" />
          <button className="btn-primary owner-auth-submit" type="submit" disabled={busy}>{busy ? 'Verifying credentials…' : 'Enter partner workspace'} <ArrowRight size={16} /></button>
        </form>
        {error && <p className="owner-auth-error" role="alert">{error}</p>}
        <p className="owner-auth-footnote">Access is limited to active restaurant accounts provisioned by ZAYKAA. For access help, contact your administrator.</p>
        <Link className="owner-auth-alt" href="/login">Customer or administrator sign in</Link>
      </section>
      <style>{`
        .owner-auth-shell{min-height:100svh;padding:30px 20px 55px;background:radial-gradient(ellipse at 50% 15%,#F1E6D4 0%,#FAF6EF 54%,#F8F0E5 100%);display:flex;align-items:center;flex-direction:column}.owner-auth-back{align-self:flex-start;display:flex;align-items:center;gap:8px;color:#796F65;font-size:12px}.owner-auth-card{width:min(100%,450px);margin:auto;background:rgba(255,253,249,.93);border:1px solid #E7DCCB;box-shadow:0 25px 80px rgba(58,46,37,.08);padding:38px}.owner-auth-wordmark{justify-content:center;font-size:22px;margin-bottom:31px}.owner-auth-icon{width:52px;height:52px;border:1px solid var(--gold);border-radius:50%;display:grid;place-items:center;color:var(--burgundy);margin:0 auto 17px}.owner-auth-eyebrow{text-align:center;font-size:9px}.owner-auth-card h1{text-align:center;font-size:43px;font-weight:400;line-height:1.12;margin:13px 0}.owner-auth-card h1 em{color:var(--burgundy);font-weight:400}.owner-auth-intro{text-align:center;font-size:12px;line-height:1.8;color:#796F65;margin:0 auto 24px;max-width:335px}.owner-auth-form{display:flex;flex-direction:column;gap:9px}.owner-auth-form label{font-size:11px;font-weight:700;color:#66584C;margin-top:4px}.owner-auth-form input{width:100%;height:46px;border:1px solid #E3D7C6;border-radius:4px;background:#fffdfa;padding:0 12px;color:var(--espresso);font-size:12px}.owner-auth-submit{margin-top:10px;width:100%;cursor:pointer}.owner-auth-submit:disabled{opacity:.65;cursor:wait}.owner-auth-error{margin:15px 0 0;background:#FBECE9;border:1px solid #E9C8C1;color:#8B302A;border-radius:4px;padding:11px 12px;font-size:11px;line-height:1.6}.owner-auth-footnote{text-align:center;color:#9A8D7F;font-size:10px;line-height:1.7;margin:24px 0 14px}.owner-auth-alt{display:block;text-align:center;color:var(--burgundy);font-size:11px;font-weight:700}@media(max-width:500px){.owner-auth-shell{padding:20px 14px 35px}.owner-auth-card{padding:29px 22px}.owner-auth-card h1{font-size:38px}.owner-auth-wordmark{margin-bottom:27px}}
      `}</style>
    </main>
  )
}
