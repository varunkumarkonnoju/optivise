import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function OAuthSuccessPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      localStorage.setItem('token', token)
      // Fetch user info and redirect to dashboard
      fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(r => r.json())
      .then(user => {
        localStorage.setItem('user', JSON.stringify(user))
        if (setUser) setUser(user)
        navigate('/dashboard')
      })
      .catch(() => navigate('/login'))
    } else {
      navigate('/login')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', flexDirection: 'column', gap: 16
    }}>
      <div style={{ fontSize: 48 }}>🎉</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
        Connecting your store...
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
        Please wait while we set up your dashboard
      </div>
    </div>
  )
}