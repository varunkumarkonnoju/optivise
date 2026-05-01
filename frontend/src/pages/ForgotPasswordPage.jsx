import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'
import OptiviseLogo from '../components/OptiviseLogo'
import LogoText from '../components/LogoText'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1"/>
      <div className="auth-orb auth-orb-2"/>
      <div className="auth-card">
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <OptiviseLogo size={44} showText={false} />
<LogoText nameSize={26} tagSize={9} />
        </div>

        {!sent ? (
          <>
            <h2 className="auth-title">Reset your password</h2>
            <p className="auth-sub">Enter your email and we'll send you a reset link.</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label>Email address</label>
                <input type="email" placeholder="you@yourstore.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoFocus/>
              </div>
              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link →'}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-success" style={{textAlign:'center'}}>
            <div className="auth-success-icon">📬</div>
            <h2 className="auth-title">Check your email</h2>
            <p className="auth-sub">
              We sent a password reset link to<br/>
              <strong style={{color:'#818CF8'}}>{email}</strong>
            </p>
            <div style={{fontSize:12,color:'#334155',marginTop:16,padding:'12px 16px',background:'rgba(99,102,241,0.07)',borderRadius:8}}>
              Didn't receive it? Check your spam folder or try again.
            </div>
          </div>
        )}

        <p className="auth-switch" style={{marginTop:20}}>
          <Link to="/login">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}