import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import ShopifyConnectButton from '../components/ShopifyConnectButton'
import './Auth.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    shopDomain: user?.shopDomain || '',
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({ name: form.name, email: form.email, shopDomain: form.shopDomain })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setSaved(true)
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

          {/* Shopify Store Connection */}
          <div style={{ background: 'rgba(150,191,72,0.05)', border: '1px solid rgba(150,191,72,0.3)', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>🛍 Shopify Store Connection</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>Connect your store to see real analytics and AI recommendations</div>

            {user?.hasShopifyToken ? (
              <div style={{ fontSize: 12, color: '#34D399', fontWeight: 600, marginBottom: 12 }}>✓ Store connected: {form.shopDomain}</div>
            ) : (
              /* Step by step guide */
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.5px' }}>HOW IT WORKS</div>
                {[
                  { step: '1', text: 'Enter your store name below (e.g. "my-store")' },
                  { step: '2', text: 'Click "Connect with Shopify" button' },
                  { step: '3', text: 'Log into your Shopify account (if not already)' },
                  { step: '4', text: 'Click "Install" to allow Optivise access' },
                  { step: "5", text: "You're done! Your data loads automatically 🎉" },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', background: 'var(--purple-dim)',
                      border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--purple-light)', flexShrink: 0
                    }}>{s.step}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 2 }}>{s.text}</div>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, padding: '6px 8px', background: 'rgba(99,102,241,0.05)', borderRadius: 6 }}>
                  🔒 <strong>Secure:</strong> We use Shopify's official OAuth. We never see your password.
                </div>
              </div>
            )}

            <ShopifyConnectButton shopDomain={form.shopDomain} />
          </div>

          {saved && <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 8, padding: '10px 14px', color: 'var(--green)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>✓ Profile saved successfully!</div>}

          <button type="submit" className="auth-btn-primary" style={{ marginTop: 4 }} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
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