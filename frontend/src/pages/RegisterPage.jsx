import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Auth.css'

const STEPS = ['Account', 'Your Store', 'All set!']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    shopDomain: '', storeSize: '', goal: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validateStep0 = () => {
    if (!form.name.trim())               return 'Please enter your name'
    if (!form.email.includes('@'))       return 'Please enter a valid email'
    if (form.password.length < 8)        return 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return null
  }

  const validateStep1 = () => {
    if (!form.shopDomain.trim()) return 'Please enter your Shopify store URL'
    return null
  }

  const nextStep = () => {
    setError('')
    if (step === 0) {
      const err = validateStep0()
      if (err) { setError(err); return }
    }
    if (step === 1) {
      const err = validateStep1()
      if (err) { setError(err); return }
      handleSubmit()
      return
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      // Clean shop domain
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

      // Auto login
      localStorage.setItem('token', data.token)
      setStep(2)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const goToDashboard = () => navigate('/dashboard')

  return (
    <div className="auth-page">
      {/* Background orbs */}
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

        {/* Progress */}
        {step < 2 && (
          <div className="auth-progress">
            {STEPS.slice(0,2).map((s, i) => (
              <div key={i} className={`auth-step-dot ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
            ))}
            <div className="auth-progress-line">
              <div className="auth-progress-fill" style={{ width: step === 0 ? '0%' : '100%' }}/>
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
              <input type="text" placeholder="Varun Kumar" value={form.name}
                onChange={e => set('name', e.target.value)} autoFocus/>
            </div>
            <div className="auth-field">
              <label>Email address</label>
              <input type="email" placeholder="varun@yourstore.com" value={form.email}
                onChange={e => set('email', e.target.value)}/>
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="Min. 8 characters" value={form.password}
                onChange={e => set('password', e.target.value)}/>
            </div>
            <div className="auth-field">
              <label>Confirm password</label>
              <input type="password" placeholder="Repeat your password" value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && nextStep()}/>
            </div>

            <button className="auth-btn-primary" onClick={nextStep}>
              Continue →
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 1 — Store */}
        {step === 1 && (
          <div className="auth-step">
            <h2 className="auth-title">Connect your Shopify store</h2>
            <p className="auth-sub">We'll pull your real products and orders automatically.</p>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label>Shopify store URL</label>
              <div className="auth-input-group">
                <input type="text" placeholder="your-store"
                  value={form.shopDomain.replace('.myshopify.com','')}
                  onChange={e => set('shopDomain', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && nextStep()}/>
                <span className="auth-input-suffix">.myshopify.com</span>
              </div>
              <div className="auth-field-hint">Find this in your Shopify admin URL</div>
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

            <div className="auth-field">
              <label>What's your main goal? (optional)</label>
              <select value={form.goal} onChange={e => set('goal', e.target.value)}>
                <option value="">Select goal</option>
                <option value="descriptions">Better product descriptions</option>
                <option value="analytics">Understand my analytics</option>
                <option value="conversion">Increase conversion rate</option>
                <option value="abtesting">Run A/B tests</option>
                <option value="all">All of the above</option>
              </select>
            </div>

            <div className="auth-actions">
              <button className="auth-btn-ghost" onClick={() => setStep(0)}>← Back</button>
              <button className="auth-btn-primary" onClick={nextStep} disabled={loading}>
                {loading ? 'Creating account...' : 'Create account →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Success */}
        {step === 2 && (
          <div className="auth-step auth-success">
            <div className="auth-success-icon">🎉</div>
            <h2 className="auth-title">Welcome to Optivise!</h2>
            <p className="auth-sub" style={{marginBottom: 28}}>
              Your account is ready. Your store is connected.<br/>
              Let's start growing your revenue.
            </p>

            <div className="auth-checklist">
              {[
                '✅ Account created',
                '✅ Store connected',
                '✅ Demo data loaded',
                '🔜 Connect your Shopify API token',
              ].map((item, i) => (
                <div key={i} className="auth-check-item"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  {item}
                </div>
              ))}
            </div>

            <button className="auth-btn-primary auth-btn-big" onClick={goToDashboard}>
              Go to my dashboard →
            </button>

            <p style={{ fontSize: 12, color: '#475569', marginTop: 16 }}>
              Login: <strong style={{color:'#818CF8'}}>{form.email}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}