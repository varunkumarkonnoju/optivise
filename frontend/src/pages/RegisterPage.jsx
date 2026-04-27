import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import './Auth.css'

const STEPS = ['Account', 'Connect Store', 'All set!']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [createdToken, setCreatedToken] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCreateAccount = async () => {
    setError('')
    if (!form.name.trim()) { setError('Please enter your name'); return }
    if (!form.email.includes('@')) { setError('Please enter a valid email'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
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
      setCreatedToken(data.token)
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
      const res = await fetch('/api/auth/shopify/install?shop=' + domain)
      const data = await res.json()
      if (data.authUrl) window.location.href = data.authUrl
    } catch {
      setError('Connection failed. Try again.')
      setLoading(false)
    }
  }

  const progressPct = step === 0 ? 0 : step === 1 ? 50 : 100

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1"/>
      <div className="auth-orb auth-orb-2"/>
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 32 32" fill="none" width="20" height="20">
              <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2"/>
              <path d="M10 22L16 10l6 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 18h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="auth-logo-text">Optivise</span>
        </div>

        {/* Progress bar */}
        {step < 2 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              {STEPS.slice(0, 2).map((s, i) => (
                <div key={i} style={{ fontSize: 11, color: i <= step ? 'var(--purple-light)' : 'var(--text-muted)', fontWeight: i === step ? 700 : 400 }}>
                  {i < step ? '✓ ' : ''}{s}
                </div>
              ))}
            </div>
            <div style={{ height: 3, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: progressPct + '%', background: 'linear-gradient(90deg, #6366F1, #06B6D4)', borderRadius: 2, transition: 'width .4s ease' }}/>
            </div>
          </div>
        )}

        {/* Step 0 — Account */}
        {step === 0 && (
          <div className="auth-step">
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-sub">Free forever. No credit card required.</p>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-field">
              <label>Full name</label>
              <input type="text" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} autoFocus/>
            </div>
            <div className="auth-field">
              <label>Email address</label>
              <input type="email" placeholder="you@yourstore.com" value={form.email} onChange={e => set('email', e.target.value)}/>
            </div>
            <div className="auth-field">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} style={{ paddingRight: 40 }}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div className="auth-field">
              <label>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateAccount()} style={{ paddingRight: 40 }}/>
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

        {/* Step 1 — Connect Shopify */}
        {step === 1 && (
          <div className="auth-step">
            <h2 className="auth-title">Connect your Shopify store</h2>
            <p className="auth-sub">One click to connect. We'll pull your real products, orders, and analytics automatically.</p>
            {error && <div className="auth-error">{error}</div>}

            <div style={{ background: 'rgba(150,191,72,0.05)', border: '1px solid rgba(150,191,72,0.3)', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🛍️</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Enter your store URL and click connect</div>
              </div>

              <div className="auth-field" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <input
                    type="text"
                    id="shopDomainInput"
                    placeholder="your-store"
                    style={{ borderRadius: '8px 0 0 8px', flex: 1 }}
                  />
                  <span style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: 'none', borderRadius: '0 8px 8px 0', padding: '10px 12px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    .myshopify.com
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  const input = document.getElementById('shopDomainInput')
                  handleConnectShopify(input.value)
                }}
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                  background: '#96BF48', color: 'white', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  opacity: loading ? 0.7 : 1
                }}
              >
                <svg width="20" height="20" viewBox="0 0 50 50" fill="white">
                  <path d="M33.3 4.7c-.1-.1-.3-.1-.5 0l-2.3.7c-.4-1.2-1-2.3-1.9-3.1C27.8 1.5 26.9 1 26 1c-.1 0-.2 0-.3 0-.3-.4-.6-.7-1-.9C24 0 23.3 0 22.6.3c-1.6.6-3.1 2.3-4.4 4.8-.9 1.8-1.6 3.9-1.9 5.8l-5.8 1.8c-.6.2-1 .7-1 1.3L8 43.5c0 .5.4.9.9.9l29.5-5.6c.5-.1.8-.5.8-1L38 5.5c0-.4-.3-.7-.7-.8zm-7.6.6c.5.5.9 1.2 1.2 2.1l-4.2 1.3c.4-1.5 1-2.8 1.7-3.7.5.1 1 .2 1.3.3zm-3.5-2.5c.3-.1.7-.1 1 .1.1 0 .2.1.3.2-.7 1-1.3 2.3-1.8 3.8l-3.1 1c.8-2.3 2-3.8 3.6-5.1zm1 4.9l5.5-1.7c.3 1.3.4 2.8.4 4.5 0 .2 0 .4 0 .6l-6.8 2.1c.1-1.9.4-3.7.9-5.5z"/>
                </svg>
                {loading ? 'Connecting...' : 'Connect with Shopify'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                🔒 Secure OAuth — we never store your password
              </p>
            </div>

            <button className="auth-btn-ghost" onClick={() => { setStep(2) }} style={{ width: '100%', textAlign: 'center' }}>
              Skip for now — explore the app first →
            </button>
          </div>
        )}

        {/* Step 2 — Success */}
        {step === 2 && (
          <div className="auth-step auth-success">
            <div className="auth-success-icon">🎉</div>
            <h2 className="auth-title">Welcome to Optivise!</h2>
            <p className="auth-sub" style={{ marginBottom: 24 }}>
              Your account is ready. Connect your store anytime from Profile settings.
            </p>
            <div className="auth-checklist">
              {[
                '✅ Account created',
                '✅ Welcome email sent',
                '🔜 Connect Shopify store (Profile → Connect with Shopify)',
              ].map((item, i) => (
                <div key={i} className="auth-check-item" style={{ animationDelay: `${i * 0.1}s` }}>{item}</div>
              ))}
            </div>
            <button className="auth-btn-primary auth-btn-big" onClick={() => navigate('/dashboard')}>
              Go to my dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}