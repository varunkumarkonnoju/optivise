import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Zap, Shield, BarChart2, Sparkles } from 'lucide-react'
import ShopifyConnectButton from '../components/ShopifyConnectButton'
import './Auth.css'
import OptiviseLogo from '../components/OptiviseLogo'
import LogoText from '../components/LogoText'

const STEPS = ['Create account', 'Connect store']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCreateAccount = async () => {
    setError('')
    if (!form.name.trim())              { setError('Please enter your name'); return }
    if (!form.email.includes('@'))      { setError('Please enter a valid email'); return }
    if (form.password.length < 8)       { setError('Password must be at least 8 characters'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, shopDomain: '' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user_email', form.email)
      localStorage.setItem('user', JSON.stringify(data))
      setStep(1)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectShopify = async (shopDomain) => {
    setLoading(true); setError('')
    try {
      let domain = shopDomain.trim().replace(/https?:\/\//, '').replace(/\/$/, '')
      if (!domain.includes('.myshopify.com')) domain = domain + '.myshopify.com'
      const email = form.email || localStorage.getItem('user_email') || ''
      const res = await fetch(`/api/auth/shopify/install?shop=${domain}&email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.authUrl) window.location.href = data.authUrl
    } catch {
      setError('Connection failed. Try again.')
      setLoading(false)
    }
  }

  const skipToDiagnosis = () => {
    // New users who skip store connection go to diagnosis
    // which will show "connect your store" empty state
    navigate('/diagnosis')
  }

  const progressPct = step === 0 ? 30 : 70

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1"/>
      <div className="auth-orb auth-orb-2"/>
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <OptiviseLogo size={44} showText={false} />
          <LogoText nameSize={26} tagSize={9} />
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ fontSize: 11, color: i <= step ? 'var(--purple-light)' : 'var(--text-muted)', fontWeight: i === step ? 700 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                {i < step ? <span style={{ color: '#10B981' }}>✓</span> : null} {s}
              </div>
            ))}
          </div>
          <div style={{ height: 3, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: progressPct + '%', background: 'linear-gradient(90deg, #6366F1, #06B6D4)', borderRadius: 2, transition: 'width .4s ease' }}/>
          </div>
        </div>

        {/* ── STEP 0: Create account ── */}
        {step === 0 && (
          <div className="auth-step">
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-sub">Free forever. No credit card required.</p>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-field">
              <label>Full name</label>
              <input type="text" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
            </div>
            <div className="auth-field">
              <label>Email address</label>
              <input type="email" placeholder="you@yourstore.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div className="auth-field">
              <label>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateAccount()} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                  {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button className="auth-btn-primary" onClick={handleCreateAccount} disabled={loading}>
              {loading ? 'Creating account...' : 'Continue →'}
            </button>
            <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        )}

        {/* ── STEP 1: Connect Shopify ── */}
        {step === 1 && (
          <div className="auth-step">
            <h2 className="auth-title">Connect your Shopify store</h2>
            <p className="auth-sub">Get your free store diagnosis in 60 seconds — real data, real insights.</p>
            {error && <div className="auth-error">{error}</div>}

            {/* What you'll get */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>After connecting you'll see:</div>
              {[
                { icon: '🩺', text: 'Store health score + revenue leaks ranked by impact' },
                { icon: '💰', text: 'Exactly how much revenue you\'re leaving on the table' },
                { icon: '✨', text: 'AI-generated descriptions for your real products' },
                { icon: '🔒', text: 'Read-only OAuth — we never modify your store without permission' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{b.icon}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{b.text}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 10 }}>
              <ShopifyConnectButton email={form.email} />
            </div>

            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
              ⚡ Takes 60 seconds · Official Shopify OAuth
            </div>

            <button className="auth-btn-ghost" onClick={skipToDiagnosis} style={{ width: '100%', textAlign: 'center' }}>
              Skip for now →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}