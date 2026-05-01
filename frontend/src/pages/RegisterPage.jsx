import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import ShopifyConnectButton from '../components/ShopifyConnectButton'
import './Auth.css'
import OptiviseLogo from '../components/OptiviseLogo'

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
      localStorage.setItem('user_email', form.email)
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
          <OptiviseLogo size={44} showText={true} textSize={20} />
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
            <p className="auth-sub">See your real store data — revenue, orders, products and AI recommendations tailored to YOUR store.</p>
            {error && <div className="auth-error">{error}</div>}

            {/* Benefits */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              {[
                { icon: '📊', text: 'Real analytics from your actual orders' },
                { icon: '✨', text: 'AI descriptions for your real products' },
                { icon: '🎯', text: 'Personalized growth recommendations' },
                { icon: '🔒', text: 'Secure OAuth — we never store your password' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 16 }}>{b.icon}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.text}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <ShopifyConnectButton />
            </div>

            <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              ⚡ Takes 30 seconds
            </div>

            <button className="auth-btn-ghost" onClick={() => { setStep(2) }} style={{ width: '100%', textAlign: 'center' }}>
              Skip for now — explore with demo data →
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