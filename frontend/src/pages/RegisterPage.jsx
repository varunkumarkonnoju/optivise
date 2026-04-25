import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'

const STEPS = ['Account', 'Your Store', 'Connect API', 'All set!']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    shopDomain: '', shopifyAccessToken: '', storeSize: '', goal: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validateStep0 = () => {
    if (!form.name.trim())                       return 'Please enter your name'
    if (!form.email.includes('@'))               return 'Please enter a valid email'
    if (form.password.length < 8)               return 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return null
  }

  const validateStep1 = () => {
    if (!form.shopDomain.trim()) return 'Please enter your Shopify store URL'
    return null
  }

  const nextStep = async () => {
    setError('')
    if (step === 0) {
      const err = validateStep0()
      if (err) { setError(err); return }
      setStep(1)
    } else if (step === 1) {
      const err = validateStep1()
      if (err) { setError(err); return }
      setStep(2)
    } else if (step === 2) {
      await handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      let domain = form.shopDomain.trim()
      if (!domain.includes('.myshopify.com')) domain = domain + '.myshopify.com'
      domain = domain.replace(/https?:\/\//, '').replace(/\/$/, '')

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          shopDomain: domain,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      // Save token
      localStorage.setItem('token', data.token)

      // If they provided Shopify token, save it immediately
      if (form.shopifyAccessToken.trim()) {
        await fetch('/api/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + data.token },
          body: JSON.stringify({ shopifyAccessToken: form.shopifyAccessToken.trim() })
        })
      }

      setStep(3)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const progressPct = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100

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
        {step < 3 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              {STEPS.slice(0,3).map((s, i) => (
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
              <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)}/>
            </div>
            <div className="auth-field">
              <label>Confirm password</label>
              <input type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} onKeyDown={e => e.key === 'Enter' && nextStep()}/>
            </div>
            <button className="auth-btn-primary" onClick={nextStep}>Continue →</button>
            <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        )}

        {/* Step 1 — Store domain */}
        {step === 1 && (
          <div className="auth-step">
            <h2 className="auth-title">Your Shopify store</h2>
            <p className="auth-sub">Tell us your store URL to connect your data.</p>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-field">
              <label>Shopify store URL</label>
              <div className="auth-input-group">
                <input type="text" placeholder="your-store"
                  value={form.shopDomain.replace('.myshopify.com','')}
                  onChange={e => set('shopDomain', e.target.value)}/>
                <span className="auth-input-suffix">.myshopify.com</span>
              </div>
              <div className="auth-field-hint">Find this in your Shopify admin URL bar</div>
            </div>
            <div className="auth-field">
              <label>Monthly revenue (optional)</label>
              <select value={form.storeSize} onChange={e => set('storeSize', e.target.value)}>
                <option value="">Select range</option>
                <option value="0-1k">$0 – $1,000</option>
                <option value="1k-10k">$1,000 – $10,000</option>
                <option value="10k-50k">$10,000 – $50,000</option>
                <option value="50k+">$50,000+</option>
              </select>
            </div>
            <div className="auth-actions">
              <button className="auth-btn-ghost" onClick={() => setStep(0)}>← Back</button>
              <button className="auth-btn-primary" onClick={nextStep}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 2 — Shopify API token */}
        {step === 2 && (
          <div className="auth-step">
            <h2 className="auth-title">Connect your store</h2>
            <p className="auth-sub">Add your Shopify API token to see real data. You can skip this and add it later from your profile.</p>
            {error && <div className="auth-error">{error}</div>}

            {/* How to get token */}
            <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple-light)', marginBottom: 10 }}>📋 How to get your API token (2 minutes):</div>
              {[
                'Go to Shopify Admin → Settings → Apps',
                'Click "Develop apps" → "Create an app"',
                'Name it "Optivise" → click Configure',
                'Enable: read_products, write_products, read_orders',
                'Click Install app → copy the access token',
              ].map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-muted)', padding: '3px 0', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--purple-light)', fontWeight: 700, flexShrink: 0 }}>{i+1}.</span>{s}
                </div>
              ))}
            </div>

            <div className="auth-field">
              <label>Shopify Admin API access token</label>
              <input type="password" placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={form.shopifyAccessToken} onChange={e => set('shopifyAccessToken', e.target.value)}/>
              <div className="auth-field-hint">Starts with shpat_ — kept secure and never shared</div>
            </div>

            <div className="auth-actions">
              <button className="auth-btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="auth-btn-primary" onClick={nextStep} disabled={loading}>
                {loading ? 'Creating account...' : 'Create account →'}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              <span style={{ cursor: 'pointer', color: 'var(--purple-light)', textDecoration: 'underline' }}
                onClick={nextStep}>Skip for now — add token later from profile</span>
            </p>
          </div>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <div className="auth-step auth-success">
            <div className="auth-success-icon">🎉</div>
            <h2 className="auth-title">Welcome to Optivise!</h2>
            <p className="auth-sub" style={{ marginBottom: 24 }}>
              Your account is ready.{form.shopifyAccessToken ? ' Your store is connected!' : ' Add your API token from Profile to see your store data.'}
            </p>
            <div className="auth-checklist">
              {[
                '✅ Account created',
                form.shopDomain ? '✅ Store domain saved' : '⚠️ Store domain missing',
                form.shopifyAccessToken ? '✅ Shopify store connected' : '🔜 Connect Shopify API token (Profile)',
                '✅ Welcome email sent',
              ].map((item, i) => (
                <div key={i} className="auth-check-item" style={{ animationDelay: `${i * 0.1}s` }}>{item}</div>
              ))}
            </div>
            <button className="auth-btn-primary auth-btn-big" onClick={() => navigate('/dashboard')}>
              Go to my dashboard →
            </button>
            <p style={{ fontSize: 12, color: '#475569', marginTop: 12 }}>
              Login: <strong style={{color:'#818CF8'}}>{form.email}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}