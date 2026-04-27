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

        {/* Step 2 — Connect with Shopify OAuth */}
        {step === 2 && (
          <div className="auth-step">
            <h2 className="auth-title">Connect your store</h2>
            <p className="auth-sub">Connect your Shopify store with one click. No manual setup needed.</p>
            {error && <div className="auth-error">{error}</div>}

            <div style={{ background: 'rgba(150,191,72,0.05)', border: '1px solid rgba(150,191,72,0.3)', borderRadius: 12, padding: '20px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🛍️</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>One-click Shopify connection</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Securely connect your store using Shopify OAuth. We never store your password.</div>
              
              <div style={{ marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="your-store.myshopify.com"
                  value={form.shopDomain}
                  onChange={e => set('shopDomain', e.target.value)}
                  style={{
                    width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)',
                    fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                onClick={async () => {
                  if (!form.shopDomain.trim()) { setError('Please enter your store URL'); return }
                  setLoading(true); setError('')
                  try {
                    // First create the account
                    await nextStep()
                    // Then redirect to Shopify OAuth
                    let domain = form.shopDomain.trim().replace(/https?:\/\//, '').replace(/\/$/, '')
                    if (!domain.includes('.myshopify.com')) domain = domain + '.myshopify.com'
                    const res = await fetch('/api/auth/shopify/install?shop=' + domain)
                    const data = await res.json()
                    if (data.authUrl) window.location.href = data.authUrl
                  } catch(e) {
                    setError('Connection failed. Try again.')
                    setLoading(false)
                  }
                }}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: '#96BF48', color: 'white', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  opacity: loading ? 0.7 : 1, marginBottom: 12
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M15.337 23.979l7.216-1.561-2.625-17.679c-.018-.099-.107-.167-.206-.167-.098 0-3.375.655-3.375.655s-1.776-1.714-2.464-2.308c-.624-.539-1.836-1.028-2.955-.616C9.777 2.77 9.013 5.29 8.771 6.11c-.799.248-1.371.426-1.371.426L2.728 9.063C2.952 7.65 2.937 7.665 2.728 9.063c-.165 1.082-4.1 31.598-4.1 31.598h26.063l-9.354-1.563z"/></svg>
                {loading ? 'Connecting...' : 'Connect with Shopify'}
              </button>
            </div>

            <div className="auth-actions">
              <button className="auth-btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="auth-btn-primary" onClick={nextStep} disabled={loading}>
                {loading ? 'Creating account...' : 'Skip & create account →'}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
              Skip to connect your store later from Profile settings
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