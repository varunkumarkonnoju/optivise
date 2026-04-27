import { useState } from 'react'

export default function ShopifyConnectButton({ shopDomain, onSuccess }) {
  const [shop, setShop] = useState(shopDomain || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    if (!shop.trim()) { setError('Please enter your store URL'); return }
    setLoading(true); setError('')
    try {
      let cleanShop = shop.trim().replace('https://', '').replace('http://', '').replace('/', '')
      if (!cleanShop.includes('.myshopify.com')) cleanShop = cleanShop + '.myshopify.com'

      const res = await fetch(`/api/auth/shopify/install?shop=${cleanShop}`)
      const data = await res.json()
      if (data.authUrl) {
        // Redirect to Shopify OAuth
        window.location.href = data.authUrl
      } else {
        setError('Failed to generate auth URL')
      }
    } catch (e) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          Your Shopify store URL
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={shop}
            onChange={e => setShop(e.target.value)}
            placeholder="your-store.myshopify.com"
            style={{
              flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)',
              fontSize: 13, outline: 'none', fontFamily: 'inherit'
            }}
          />
        </div>
        {error && <div style={{ color: '#F87171', fontSize: 12, marginTop: 6 }}>{error}</div>}
      </div>
      <button
        onClick={handleConnect}
        disabled={loading}
        style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: '#96BF48', color: 'white', fontSize: 14, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          opacity: loading ? 0.7 : 1
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M15.337 23.979l7.216-1.561c0 0-2.607-17.579-2.625-17.679-.018-.099-.107-.167-.206-.167-.098 0-3.375.655-3.375.655s-1.776-1.714-2.464-2.308c-.624-.539-1.836-1.028-2.955-.616C9.777 2.77 9.013 5.29 8.771 6.11c-.799.248-1.371.426-1.371.426s-.798.248-2.14.666C2.952 7.65 2.937 7.665 2.728 9.063c-.165 1.082-4.1 31.598-4.1 31.598h26.063l-9.354-1.563zM13.22 2.928c-.491.152-1.046.324-1.643.509.006-.255.012-.511.006-.768.025-.717.214-1.447.576-1.962.41.491.68 1.228.677 2.004l-.004.217zm-.787-2.927c.277 0 .56.069.826.204-.426.629-.625 1.58-.633 2.464 0 .103-.003.207-.005.311-.623.192-1.239.383-1.804.558.381-1.405 1.253-3.357 1.616-3.537zm-.726 11.237l1.019-3.219c.791.396 1.435.483 2.226.205.219-.075.418-.188.598-.328l-1.135 3.342h-2.708z"/>
        </svg>
        {loading ? 'Connecting...' : 'Connect with Shopify'}
      </button>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
        Secure OAuth — we never store your password
      </div>
    </div>
  )
}