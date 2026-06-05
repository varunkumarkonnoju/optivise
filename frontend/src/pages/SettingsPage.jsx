import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle, ExternalLink, Unlink } from 'lucide-react'

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [shopInput, setShopInput] = useState('')
  const [showConnectForm, setShowConnectForm] = useState(false)
  const token = localStorage.getItem('token')

  // Profile fields
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  // App settings — only real ones
  const [settings, setSettings] = useState({
    weeklyReport: true,
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    timezone: 'America/Chicago',
  })

  useEffect(() => {
    fetch('/api/settings', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(r => r.json())
    .then(data => {
      setSettings({
        weeklyReport: data.weeklyReport ?? true,
        theme: data.theme || 'dark',
        language: data.language || 'en',
        currency: data.currency || 'USD',
        timezone: data.timezone || 'America/Chicago',
      })
    })
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }))

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        localStorage.setItem('optivise_settings', JSON.stringify(settings))
        window.dispatchEvent(new Event('settings-updated'))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (e) {
      console.error('Save failed', e)
    }
  }

  // ── SAVE PROFILE ────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true); setProfileError(''); setProfileSaved(false)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ name: profile.name, email: profile.email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      if (setUser && user) setUser({ ...user, name: profile.name, email: profile.email })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (e) {
      setProfileError(e.message)
    } finally {
      setSavingProfile(false)
    }
  }

  // ── DISCONNECT SHOPIFY ──────────────────────────────
  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect your Shopify store? You can reconnect anytime.')) return
    setDisconnecting(true)
    try {
      const res = await fetch('/api/auth/shopify/disconnect', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      })
      if (res.ok) {
        const userRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
        if (userRes.ok) {
          const updatedUser = await userRes.json()
          if (setUser) setUser(updatedUser)
        }
        window.location.reload()
      }
    } catch (e) {
      console.error('Disconnect failed', e)
    } finally {
      setDisconnecting(false)
    }
  }

  // ── CONNECT SHOPIFY ─────────────────────────────────
  const handleConnect = async () => {
    if (!shopInput.trim()) return
    setConnecting(true)
    try {
      let shop = shopInput.trim()
        .replace('https://', '').replace('http://', '').replace('/', '')
      if (!shop.includes('.myshopify.com')) shop = shop + '.myshopify.com'

      const email = user?.email || ''
      const res = await fetch(`/api/auth/shopify/install?shop=${encodeURIComponent(shop)}&email=${encodeURIComponent(email)}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      const data = await res.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch (e) {
      console.error('Connect failed', e)
    } finally {
      setConnecting(false)
    }
  }

  const shopConnected = !!(user?.shopDomain)

  const Section = ({ title, children }) => (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        {title}
      </div>
      {children}
    </div>
  )

  const Toggle = ({ label, desc, value, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <button onClick={onChange} style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: value ? '#6366F1' : 'var(--bg-secondary)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 3, left: value ? 23 : 3,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}/>
      </button>
    </div>
  )

  const SettingSelect = ({ label, desc, value, onChange, options }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 6, padding: '5px 10px', color: 'var(--text-primary)',
        fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', outline: 'none'
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div className="spinner"/>
    </div>
  )

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Manage your profile, store connection, and preferences</p>
      </div>

      {/* ── PROFILE ── */}
      <Section title="👤 Profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white', flexShrink: 0 }}>
            {profile.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{profile.name || 'Your name'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{profile.email}</div>
            <div style={{ fontSize: 11, color: 'var(--purple-light)', marginTop: 3, fontWeight: 600 }}>{user?.role || 'Store Owner'} · {user?.plan || 'Free'} plan</div>
          </div>
        </div>

        {profileError && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 12 }}>{profileError}</div>}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Full name</label>
          <input
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            placeholder="Your full name"
            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email address</label>
          <input
            type="email"
            value={profile.email}
            onChange={e => setProfile({ ...profile, email: e.target.value })}
            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {profileSaved && <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 8, padding: '8px 12px', color: 'var(--green)', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>✓ Profile saved</div>}

        <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary" style={{ fontSize: 13 }}>
          {savingProfile ? 'Saving...' : 'Save profile'}
        </button>
      </Section>

      {/* ── SHOPIFY CONNECTION ── */}
      <Section title="🛍️ Shopify Store Connection">
        {shopConnected ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={16} color="#10B981" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Store connected
                  </div>
                  <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 2 }}>
                    {user?.shopDomain}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={`https://${user?.shopDomain}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'none' }}
                >
                  <ExternalLink size={11} /> Admin
                </a>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, color: '#EF4444', cursor: disconnecting ? 'not-allowed' : 'pointer', opacity: disconnecting ? 0.7 : 1 }}
                >
                  <Unlink size={11} />
                  {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
            <div style={{ padding: '10px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
              Disconnecting will remove your store data from Optivise. You can reconnect anytime.
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', marginBottom: 16 }}>
              <AlertCircle size={16} color="#F59E0B" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>No store connected</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Connect your Shopify store to unlock all features</div>
              </div>
            </div>

            {!showConnectForm ? (
              <button
                onClick={() => setShowConnectForm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#6366F1', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}
              >
                🛍️ Connect Shopify Store
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Enter your Shopify store URL:
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={shopInput}
                    onChange={e => setShopInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConnect()}
                    placeholder="yourstore.myshopify.com"
                    style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button
                    onClick={handleConnect}
                    disabled={connecting || !shopInput.trim()}
                    style={{ background: '#6366F1', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, color: 'white', cursor: connecting ? 'not-allowed' : 'pointer', opacity: connecting ? 0.7 : 1, whiteSpace: 'nowrap' }}
                  >
                    {connecting ? 'Connecting...' : 'Connect →'}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  🔒 Official Shopify OAuth · Read-only safe · Takes 90 seconds
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── NOTIFICATIONS (only the real one) ── */}
      <Section title="🔔 Notifications">
        <Toggle
          label="Weekly performance report"
          desc="Get a weekly email every Monday with your real revenue, top product, and opportunities to improve"
          value={settings.weeklyReport}
          onChange={() => toggle('weeklyReport')}
        />
      </Section>

      {/* ── APPEARANCE ── */}
      <Section title="🎨 Appearance & Display">
        <SettingSelect label="Theme" desc="Choose your preferred color scheme" value={settings.theme}
          onChange={v => setSettings(s => ({...s, theme: v}))}
          options={[{ value: 'dark', label: '🌙 Dark (default)' }, { value: 'light', label: '☀️ Light (coming soon)' }]} />
        <SettingSelect label="Language" desc="Choose your preferred language" value={settings.language}
          onChange={v => setSettings(s => ({...s, language: v}))}
          options={[{ value: 'en', label: '🇺🇸 English' }, { value: 'es', label: '🇪🇸 Spanish (coming soon)' }, { value: 'fr', label: '🇫🇷 French (coming soon)' }]} />
        <SettingSelect label="Currency display" desc="How prices are displayed across the app" value={settings.currency}
          onChange={v => setSettings(s => ({...s, currency: v}))}
          options={[
            { value: 'USD', label: '🇺🇸 USD ($)' },
            { value: 'EUR', label: '🇪🇺 EUR (€)' },
            { value: 'GBP', label: '🇬🇧 GBP (£)' },
            { value: 'CAD', label: '🇨🇦 CAD (C$)' },
            { value: 'AUD', label: '🇦🇺 AUD (A$)' },
            { value: 'INR', label: '🇮🇳 INR (₹)' },
          ]} />
        <SettingSelect label="Timezone" desc="Used for displaying dates and times" value={settings.timezone}
          onChange={v => setSettings(s => ({...s, timezone: v}))}
          options={[
            { value: 'America/Chicago', label: '🕐 Central Time (CT)' },
            { value: 'America/New_York', label: '🕐 Eastern Time (ET)' },
            { value: 'America/Los_Angeles', label: '🕐 Pacific Time (PT)' },
            { value: 'America/Denver', label: '🕐 Mountain Time (MT)' },
            { value: 'Europe/London', label: '🕐 London (GMT)' },
            { value: 'Europe/Paris', label: '🕐 Paris (CET)' },
            { value: 'Asia/Kolkata', label: '🕐 India (IST)' },
            { value: 'Asia/Tokyo', label: '🕐 Tokyo (JST)' },
          ]} />
      </Section>

      {saved && (
        <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 8, padding: '10px 14px', color: 'var(--green)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          ✓ Settings saved successfully!
        </div>
      )}

      <button onClick={handleSave} className="auth-btn-primary" style={{ width: '100%', marginBottom: 24 }}>
        Save Settings
      </button>

      {/* ── SUBSCRIPTION ── */}
      <Section title="💳 Subscription">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Current plan</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>You are on the <strong style={{color:'var(--purple-light)'}}>{user?.plan || 'Free'}</strong> plan</div>
          </div>
          <button onClick={() => navigate('/pricing')} className="btn-primary" style={{ fontSize: 12 }}>Upgrade →</button>
        </div>
      </Section>

      {/* ── ACCOUNT ── */}
      <Section title="⚙️ Account">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Sign out</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sign out of your Optivise account</div>
          </div>
          <button onClick={() => { logout(); navigate('/home') }} className="btn-ghost" style={{ fontSize: 12 }}>Sign out</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F87171' }}>Delete account</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Permanently delete your account and all data</div>
          </div>
          <button onClick={() => {
            if (window.confirm('Are you sure? This cannot be undone.')) {
              alert('To delete your account and all associated data, please email hello@optiviseai.io and we will process it promptly.')
            }
          }} className="btn-ghost" style={{ fontSize: 12, color: '#F87171', borderColor: 'rgba(239,68,68,0.3)' }}>
            Delete account
          </button>
        </div>
      </Section>
    </div>
  )
}