'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Chrome, ShieldCheck, UtensilsCrossed } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [mode, setMode] = useState<'customer' | 'admin'>('customer')
  const [email, setEmail] = useState('anantbps@gmail.com')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function signInWithGoogle() {
    setBusy(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=%2Fauth%2Fcomplete` },
      })
      if (authError) throw authError
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Google sign-in is unavailable. Please try again.')
      setBusy(false)
    }
  }

  async function signInAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (authError || !data.user) throw new Error('Email or password is incorrect.')
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .limit(1)
      if (roleError || !roles?.length) {
        await supabase.auth.signOut()
        throw new Error('This account has not been granted administrator access.')
      }
      window.location.assign('/auth/complete?next=%2Fadmin')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in.')
      setBusy(false)
    }
  }

  return (
    <main className="auth-shell">
      <Link href="/" className="auth-back"><ArrowLeft size={15} /> Back to ZAYKAA</Link>
      <section className="auth-card">
        <Link className="wordmark auth-wordmark" href="/"><span className="brand-mark"><UtensilsCrossed size={19} /></span><span>ZAYKAA<small>THE ART OF GOOD TASTE</small></span></Link>
        <div className="eyebrow auth-eyebrow"><ShieldCheck size={14} /> A more personal table</div>
        <h1 className="serif">Welcome, <em>beautifully.</em></h1>
        <p className="auth-intro">Sign in to discover thoughtful kitchens and bring your favourites closer.</p>
        <div className="auth-tabs" role="tablist" aria-label="Sign-in type">
          <button type="button" role="tab" aria-selected={mode === 'customer'} className={mode === 'customer' ? 'active' : ''} onClick={() => { setMode('customer'); setError('') }}>Customer</button>
          <button type="button" role="tab" aria-selected={mode === 'admin'} className={mode === 'admin' ? 'active' : ''} onClick={() => { setMode('admin'); setError('') }}>Administrator</button>
        </div>
        {mode === 'customer' ? (
          <div className="auth-panel">
            <button className="google-button" type="button" disabled={busy} onClick={signInWithGoogle}><Chrome size={18} /> {busy ? 'Connecting…' : 'Continue with Google'} <ArrowRight size={16} /></button>
            <p className="auth-hint">Secure Google sign-in. No separate ZAYKAA password required.</p>
          </div>
        ) : (
          <form className="auth-panel auth-form" onSubmit={signInAdmin}>
            <label htmlFor="admin-email">Administrator email</label>
            <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            <button className="btn-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'} <ArrowRight size={16} /></button>
            <p className="auth-hint">Admin access is granted explicitly in the database; the email address alone is not sufficient.</p>
          </form>
        )}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <div className="auth-divider"><span /> <span>For restaurant partners</span> <span /></div>
        <Link className="owner-link" href="/restaurant/login">Sign in with your Owner ID <ArrowRight size={15} /></Link>
        <p className="auth-legal">By continuing, you agree to use ZAYKAA responsibly and keep your sign-in credentials private.</p>
      </section>
      <style>{`
        .auth-shell{min-height:100svh;padding:30px 20px 55px;background:radial-gradient(ellipse at 50% 15%,#F1E6D4 0%,#FAF6EF 54%,#F8F0E5 100%);display:flex;align-items:center;flex-direction:column}.auth-back{align-self:flex-start;display:flex;align-items:center;gap:8px;color:#796F65;font-size:12px}.auth-card{width:min(100%,450px);margin:auto;background:rgba(255,253,249,.92);border:1px solid #E7DCCB;box-shadow:0 25px 80px rgba(58,46,37,.08);padding:38px 38px 30px}.auth-wordmark{justify-content:center;font-size:22px;margin-bottom:33px}.auth-eyebrow{display:flex;align-items:center;justify-content:center;gap:7px}.auth-card h1{text-align:center;font-size:42px;font-weight:400;line-height:1.12;margin:15px 0 11px;letter-spacing:-.035em}.auth-card h1 em{color:var(--burgundy);font-weight:400}.auth-intro{text-align:center;font-size:12px;line-height:1.8;color:#796F65;margin:0 auto 26px;max-width:320px}.auth-tabs{display:grid;grid-template-columns:1fr 1fr;padding:4px;border:1px solid var(--line);background:#F6EFE4;border-radius:999px;gap:4px}.auth-tabs button{border:0;background:transparent;border-radius:999px;min-height:39px;color:#796F65;font-size:12px;cursor:pointer}.auth-tabs button.active{background:white;color:var(--burgundy);box-shadow:0 2px 8px #3A2E2510;font-weight:700}.auth-panel{padding-top:22px}.google-button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 16px;min-height:51px;border:1px solid #DCCDB7;background:#fffdfa;border-radius:4px;color:var(--espresso);font-size:12px;font-weight:700;cursor:pointer}.google-button:disabled,.auth-submit:disabled{opacity:.65;cursor:wait}.auth-hint{text-align:center;color:#87796C;font-size:10px;line-height:1.7;margin:13px 0 0}.auth-form{display:flex;flex-direction:column;gap:9px}.auth-form label{font-size:11px;font-weight:700;color:#66584C;margin-top:4px}.auth-form input{width:100%;height:45px;border:1px solid #E3D7C6;border-radius:4px;background:#fffdfa;padding:0 12px;color:var(--espresso);font-size:13px}.auth-submit{margin-top:8px;width:100%;cursor:pointer}.auth-error{margin:15px 0 0;background:#FBECE9;border:1px solid #E9C8C1;color:#8B302A;border-radius:4px;padding:11px 12px;font-size:11px;line-height:1.6}.auth-divider{display:flex;align-items:center;gap:11px;color:#9A8D7F;font-size:9px;margin:27px 0 17px;white-space:nowrap}.auth-divider span:first-child,.auth-divider span:last-child{height:1px;flex:1;background:#E8DDCE}.owner-link{display:flex;align-items:center;justify-content:center;gap:8px;color:var(--burgundy);font-size:12px;font-weight:700}.auth-legal{text-align:center;color:#9A8D7F;font-size:9px;line-height:1.7;margin:25px 0 0}@media(max-width:500px){.auth-shell{padding:20px 14px 35px}.auth-card{padding:29px 22px 25px}.auth-card h1{font-size:37px}.auth-wordmark{margin-bottom:27px}}
      `}</style>
    </main>
  )
}
