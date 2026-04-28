import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    weeklyReport: true,
    lowStockAlerts: true,
    newOrderAlerts: true,
    aiSuggestions: true,
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    timezone: 'America/Chicago',
  })

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }))

  const handleSave = () => {
    localStorage.setItem('optivise_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const Section = ({ title, children }) => (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        {title}
      </div>
      {children}
    </div>
  )

  const Toggle = ({ label, desc, value, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
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

  const Select = ({ label, value, onChange, options }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 6, padding: '5px 10px', color: 'var(--text-primary)',
        fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', outline: 'none'
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Manage your app preferences and notifications</p>
      </div>

      {/* Notifications */}
      <Section title="🔔 Notification Preferences">
        <Toggle label="Email notifications" desc="Receive important updates via email" value={settings.emailNotifications} onChange={() => toggle('emailNotifications')} />
        <Toggle label="Weekly performance report" desc="Get a weekly summary of your store performance" value={settings.weeklyReport} onChange={() => toggle('weeklyReport')} />
        <Toggle label="Low stock alerts" desc="Get notified when products are running low" value={settings.lowStockAlerts} onChange={() => toggle('lowStockAlerts')} />
        <Toggle label="New order alerts" desc="Get notified when new orders come in" value={settings.newOrderAlerts} onChange={() => toggle('newOrderAlerts')} />
        <Toggle label="AI suggestions" desc="Receive AI-powered growth recommendations" value={settings.aiSuggestions} onChange={() => toggle('aiSuggestions')} />
      </Section>

      {/* Appearance */}
      <Section title="🎨 Appearance">
        <Select label="Theme" value={settings.theme} onChange={v => setSettings(s => ({...s, theme: v}))}
          options={[{ value: 'dark', label: 'Dark (default)' }, { value: 'light', label: 'Light (coming soon)' }]} />
        <Select label="Language" value={settings.language} onChange={v => setSettings(s => ({...s, language: v}))}
          options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Spanish (coming soon)' }, { value: 'fr', label: 'French (coming soon)' }]} />
      </Section>

      {/* Store Preferences */}
      <Section title="🛍️ Store Preferences">
        <Select label="Currency display" value={settings.currency} onChange={v => setSettings(s => ({...s, currency: v}))}
          options={[{ value: 'USD', label: 'USD ($)' }, { value: 'EUR', label: 'EUR (€)' }, { value: 'GBP', label: 'GBP (£)' }, { value: 'CAD', label: 'CAD (C$)' }]} />
        <Select label="Timezone" value={settings.timezone} onChange={v => setSettings(s => ({...s, timezone: v}))}
          options={[
            { value: 'America/Chicago', label: 'Central Time (CT)' },
            { value: 'America/New_York', label: 'Eastern Time (ET)' },
            { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
            { value: 'America/Denver', label: 'Mountain Time (MT)' },
            { value: 'Europe/London', label: 'London (GMT)' },
            { value: 'Europe/Paris', label: 'Paris (CET)' },
          ]} />
      </Section>

      {/* Account */}
      <Section title="👤 Account">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Profile settings</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Update name, email, and store connection</div>
          </div>
          <button onClick={() => navigate('/profile')} className="btn-ghost" style={{ fontSize: 12 }}>Go to Profile →</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Subscription plan</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Currently on <strong style={{color:'var(--purple-light)'}}>{user?.plan || 'Free'}</strong> plan</div>
          </div>
          <button onClick={() => navigate('/pricing')} className="btn-primary" style={{ fontSize: 12 }}>Upgrade →</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F87171' }}>Delete account</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Permanently delete your account and data</div>
          </div>
          <button className="btn-ghost" style={{ fontSize: 12, color: '#F87171', borderColor: 'rgba(239,68,68,0.3)' }}>Delete</button>
        </div>
      </Section>

      {saved && <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 8, padding: '10px 14px', color: 'var(--green)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>✓ Settings saved!</div>}

      <button onClick={handleSave} className="auth-btn-primary" style={{ width: '100%' }}>
        Save Settings
      </button>
    </div>
  )
}