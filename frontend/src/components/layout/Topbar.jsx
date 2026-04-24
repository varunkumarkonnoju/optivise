import { Bell, Plus, Search, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Layout.css'

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const notifications = [
    { icon: '✨', text: 'AI generated 3 new recommendations', time: 'Just now', color: '#818CF8' },
    { icon: '📊', text: 'Your store revenue is up 12% this week', time: '1h ago', color: '#34D399' },
    { icon: '🧪', text: 'A/B test "Homepage Hero" has new results', time: '3h ago', color: '#FCD34D' },
    { icon: '🎯', text: 'New optimization opportunity detected', time: '1d ago', color: '#F472B6' },
  ]

  const quickActions = [
    { icon: '🧪', label: 'New A/B Test', path: '/abtesting' },
    { icon: '✨', label: 'Generate Description', path: '/products' },
    { icon: '📊', label: 'View Analytics', path: '/analytics' },
    { icon: '💬', label: 'Ask AI Assistant', path: '/assistant' },
  ]

  return (
    <div className="topbar" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={18} />
        </button>
        <div className="topbar-search">
          <Search size={14} />
          <input placeholder="Search anything..." readOnly />
          <span className="kbd">⌘K</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* + New button */}
        <div style={{ position: 'relative' }}>
          <button className="btn-primary" style={{ height: 36 }}
            onClick={() => { setShowNew(!showNew); setShowNotif(false) }}>
            <Plus size={14} /> New
          </button>
          {showNew && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-title">Quick Actions</div>
              {quickActions.map((a, i) => (
                <div key={i} className="topbar-dropdown-item"
                  onClick={() => { navigate(a.path); setShowNew(false) }}>
                  <span style={{ fontSize: 16 }}>{a.icon}</span>
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button className="notif-btn"
            onClick={() => { setShowNotif(!showNotif); setShowNew(false) }}>
            <Bell size={15} />
            <span className="notif-dot" />
          </button>
          {showNotif && (
            <div className="topbar-dropdown topbar-dropdown-wide">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="topbar-dropdown-title" style={{ marginBottom: 0 }}>Notifications</div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11 }}
                  onClick={() => setShowNotif(false)}>Mark all read</button>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="topbar-dropdown-item" style={{ alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: n.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>{n.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="topbar-user" onClick={() => { navigate('/profile'); setShowNotif(false); setShowNew(false) }}
          style={{ cursor: 'pointer' }}>
          <div style={{ width: 34, height: 34, fontSize: 13, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, color: 'white' }}>
            {user?.name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="topbar-name">{user?.name || '...'}</div>
            <div className="topbar-role">{user?.role || ''}</div>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      {(showNotif || showNew) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => { setShowNotif(false); setShowNew(false) }} />
      )}
    </div>
  )
}