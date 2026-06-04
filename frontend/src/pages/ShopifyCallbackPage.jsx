import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ShopifyCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [status, setStatus] = useState('Connecting your store...')
  const [error, setError] = useState(null)

  useEffect(() => {
    const code  = params.get('code')
    const shop  = params.get('shop')
    const state = params.get('state')
    const hmac  = params.get('hmac')

    if (!code || !shop) {
      setError('Missing required parameters from Shopify.')
      setTimeout(() => navigate('/login?error=oauth_failed'), 2000)
      return
    }

    setStatus('Verifying connection...')

    // Forward the FULL original query string so the backend can verify Shopify's HMAC
    const token = localStorage.getItem('token')
    const qs = window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : window.location.search
    fetch(`/api/auth/shopify/exchange?${qs}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      },
    })
    .then(r => r.json())
    .then(data => {
      if (data.token) {
        setStatus('Store connected! Loading your dashboard...')
        localStorage.setItem('token', data.token)

        // Fetch updated user
        fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + data.token }
        })
        .then(r => r.json())
        .then(user => {
          localStorage.setItem('user', JSON.stringify(user))
          if (setUser) setUser(user)
          setTimeout(() => navigate('/insights'), 500)
        })
        .catch(() => navigate('/dashboard'))
      } else {
        setError(data.error || 'Connection failed. Please try again.')
        setTimeout(() => navigate('/settings'), 2000)
      }
    })
    .catch(err => {
      console.error('OAuth exchange error:', err)
      setError('Connection failed. Please try again.')
      setTimeout(() => navigate('/settings'), 2000)
    })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-primary)',
      flexDirection: 'column', gap: 16,
    }}>
      {error ? (
        <>
          <div style={{ fontSize: 48 }}>❌</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#EF4444' }}>{error}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Redirecting...</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48 }}>🛍️</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            {status}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Please wait while we set up your store
          </div>
          <div className="spinner" style={{ marginTop: 8 }} />
        </>
      )}
    </div>
  )
}