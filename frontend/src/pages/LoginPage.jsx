import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Auth.css'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password. Try sarah@optivise.io / demo1234')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1"/>
      <div className="auth-orb auth-orb-2"/>

      <div className="auth-card">
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

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to your store dashboard</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email address</label>
            <input type="email" placeholder="you@yourstore.com" value={email}
              onChange={e => setEmail(e.target.value)} autoFocus required/>
          </div>
          <div className="auth-field">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <label>Password</label>
              <Link to="/forgot-password" style={{fontSize:11,color:'#6366F1',textDecoration:'none'}}>Forgot password?</Link>
            </div>
            <input type="password" placeholder="Your password" value={password}
              onChange={e => setPassword(e.target.value)} required/>
          </div>
          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>


        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}