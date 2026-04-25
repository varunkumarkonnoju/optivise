import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [form, setForm] = useState({
    name:                user?.name || '',
    email:               user?.email || '',
    shopDomain:          user?.shopDomain || '',
    shopifyAccessToken:  '',
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      const body = {
        name:       form.name,
        email:      form.email,
        shopDomain: form.shopDomain,
      }
      if (form.shopifyAccessToken.trim()) {
        body.shopifyAccessToken = form.shopifyAccessToken.trim()
      }
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setSaved(true)
      setForm(f => ({ ...f, shopifyAccessToken: '' }))
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Account Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Manage your profile and store connection</p>
      </div>

      {/* Profile card */}
      <div className="card" style={{ padding: 28, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white', flexShrink: 0 }}>
            {form.name?.charAt(0) || 'V'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{form.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{form.email}</div>
            <div style={{ fontSize: 11, color: 'var(--purple-light)', marginTop: 4, fontWeight: 600 }}>{user?.role || 'Store Owner'} · {user?.plan || 'Free'} plan</div>
          </div>
        </div>

        {error && <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSave}>
          <div className="auth-field">
            <label>Full name</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name"/>
          </div>
          <div className="auth-field">
            <label>Email address</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
          </div>

          <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>🛍 Shopify Store Connection</div>

            <div className="auth-field" style={{ marginBottom: 12 }}>
              <label>Store domain</label>
              <input type="text" value={form.shopDomain} onChange={e => setForm({...form, shopDomain: e.target.value})} placeholder="your-store.myshopify.com"/>
            </div>

            <div className="auth-field" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ margin: 0 }}>Admin API access token</label>
                {user?.hasShopifyToken && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>✓ Token saved</span>}
              </div>
              <input
                type={showToken ? 'text' : 'password'}
                value={form.shopifyAccessToken}
                onChange={e => setForm({...form, shopifyAccessToken: e.target.value})}
                placeholder={user?.hasShopifyToken ? 'Enter new token to update' : 'shpat_xxxxxxxxxxxxxxxxxxxx'}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Find in Shopify Admin → Settings → Apps → Develop apps → Your app → API credentials
              </div>
            </div>
          </div>

          {saved && <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 8, padding: '10px 14px', color: 'var(--green)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>✓ Profile saved successfully!</div>}

          <button type="submit" className="auth-btn-primary" style={{ marginTop: 4 }} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* How to get Shopify token */}
      <div className="card" style={{ padding: 20, marginBottom: 16, borderColor: 'rgba(99,102,241,0.2)' }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--purple-light)' }}>📋 How to get your Shopify API token</div>
        {[
          'Go to your Shopify Admin → Settings',
          'Click "Apps and sales channels"',
          'Click "Develop apps" → "Create an app"',
          'Name it "Optivise" → Configure Admin API scopes',
          'Enable: read_products, write_products, read_orders',
          'Click "Install app" → Copy the API access token',
        ].map((step, i) => (
          <div key={i} style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 0', display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--purple-light)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
            {step}
          </div>
        ))}
      </div>

      {/* Billing */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Subscription Plan</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              You are on the <strong style={{color:'var(--purple-light)'}}>{user?.plan || 'Free'}</strong> plan
            </div>
          </div>
          <button className="btn-primary" onClick={() => navigate('/pricing')}>Upgrade →</button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: 24, borderColor: 'rgba(239,68,68,0.2)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--red)', marginBottom: 8 }}>Danger Zone</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Sign out or delete your account permanently.</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={() => { logout(); navigate('/home') }}>Sign out</button>
          <button className="btn-ghost" style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }}>Delete account</button>
        </div>
      </div>
    </div>
  )
}