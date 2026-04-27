import { useState } from 'react'

export default function ShopifyConnectButton({ shopDomain }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shop, setShop] = useState(shopDomain ? shopDomain.replace('.myshopify.com', '') : '')
  const [showInput, setShowInput] = useState(false)

  const handleConnect = async () => {
    if (!showInput) { setShowInput(true); return }
    if (!shop.trim()) { setError('Please enter your store name'); return }
    setLoading(true); setError('')
    try {
      let domain = shop.trim().replace(/https?:\/\//, '').replace(/\/$/, '')
      if (!domain.includes('.myshopify.com')) domain = domain + '.myshopify.com'
      const res = await fetch(`/api/auth/shopify/install?shop=${domain}`)
      const data = await res.json()
      if (data.authUrl) window.location.href = data.authUrl
      else setError('Failed to connect. Try again.')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {showInput && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 6 }}>
            <input
              type="text"
              value={shop}
              onChange={e => setShop(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
              placeholder="your-store"
              autoFocus
              style={{
                flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: '8px 0 0 8px', padding: '10px 12px', color: 'var(--text-primary)',
                fontSize: 13, outline: 'none', fontFamily: 'inherit'
              }}
            />
            <span style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: 'none',
              borderRadius: '0 8px 8px 0', padding: '10px 10px', fontSize: 12,
              color: 'var(--text-muted)', whiteSpace: 'nowrap'
            }}>
              .myshopify.com
            </span>
          </div>
          {error && <div style={{ color: '#F87171', fontSize: 12 }}>{error}</div>}
        </div>
      )}
      <button
        onClick={handleConnect}
        disabled={loading}
        style={{
          width: '100%', padding: '13px', borderRadius: 10, border: 'none',
          background: '#96BF48', color: 'white', fontSize: 14, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          opacity: loading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(150,191,72,0.3)',
          transition: 'all 0.2s'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M15.337 23.979l7.216-1.561c0 0-2.607-17.579-2.625-17.679-.018-.099-.107-.167-.206-.167-.098 0-3.375.655-3.375.655s-1.776-1.714-2.464-2.308c-.624-.539-1.836-1.028-2.955-.616C9.777 2.77 9.013 5.29 8.771 6.11c-.799.248-1.371.426-1.371.426s-.798.248-2.14.666C2.952 7.65 2.937 7.665 2.728 9.063c-.165 1.082-4.1 31.598-4.1 31.598h26.063l-9.354-1.563z"/>
        </svg>
        {loading ? 'Connecting...' : showInput ? 'Connect →' : 'Connect with Shopify'}
      </button>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
        🔒 Secure OAuth — we never store your password
      </div>
    </div>
  )
}