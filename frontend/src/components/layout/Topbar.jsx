import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Bell, Plus, Search, ChevronDown, User, Settings, LogOut, HelpCircle } from 'lucide-react'

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotif, setLoadingNotif] = useState(false)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  // Fetch real notifications
  const fetchNotifications = async () => {
    setLoadingNotif(true)
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e)
    } finally {
      setLoadingNotif(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const newCount = notifications.filter(n => n.isNew).length

  return (
    <header style={{
      height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onMenuClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }}/>
          <input placeholder="Search anything..." style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8,
            padding: '7px 12px 7px 30px', fontSize: 13, color: 'var(--text-primary)',
            width: 220, outline: 'none', fontFamily: 'inherit'
          }}/>
          <kbd style={{ position: 'absolute', right: 8, fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border)' }}>⌘K</kbd>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* New button */}
        <button onClick={() => navigate('/products')} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
          color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13,
          fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
        }}>
          <Plus size={14}/> New
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowNotif(!showNotif); setShowUser(false) }} style={{
            position: 'relative', background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, padding: '7px 8px', cursor: 'pointer', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center'
          }}>
            <Bell size={16}/>
            {newCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, background: '#EF4444',
                color: 'white', borderRadius: '50%', width: 16, height: 16,
                fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{newCount}</span>
            )}
          </button>

          {showNotif && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 360,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 200, overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                  Notifications {newCount > 0 && <span style={{ background: '#EF4444', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 6 }}>{newCount}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={fetchNotifications} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11 }}>
                    {loadingNotif ? '⟳' : 'Refresh'}
                  </button>
                  <span style={{ fontSize: 11, color: 'var(--purple-light)', cursor: 'pointer' }}>Mark all read</span>
                </div>
              </div>

              {/* Notification list */}
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {loadingNotif && notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    No notifications yet
                  </div>
                ) : notifications.map((n, i) => (
                  <div key={n.id || i} style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border)',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: n.isNew ? 'rgba(99,102,241,0.04)' : 'transparent',
                    cursor: 'pointer', transition: 'background .15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.isNew ? 'rgba(99,102,241,0.04)' : 'transparent'}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: (n.color || '#6366F1') + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                    }}>
                      {n.icon}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.title}</div>
                        {n.isNew && <span style={{ background: '#6366F1', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>New</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, opacity: 0.7 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--purple-light)', cursor: 'pointer', fontWeight: 600 }}>
                  View all notifications →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowUser(!showUser); setShowNotif(false) }} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none',
            border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px',
            cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'inherit'
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0
            }}>
              {user?.name?.charAt(0) || 'V'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.name || 'Varun'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>Store Owner</div>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }}/>
          </button>

          {showUser && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 200,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 200, overflow: 'hidden'
            }}>
              {[
                { icon: <User size={14}/>, label: 'Profile', action: () => navigate('/profile') },
                { icon: <Settings size={14}/>, label: 'Settings', action: () => navigate('/profile') },
                { icon: <HelpCircle size={14}/>, label: 'Help & Support', action: () => {} },
              ].map((item, i) => (
                <button key={i} onClick={() => { item.action(); setShowUser(false) }} style={{
                  width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center',
                  gap: 10, fontSize: 13, fontFamily: 'inherit', borderBottom: '1px solid var(--border)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button onClick={() => { logout(); navigate('/home') }} style={{
                width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                cursor: 'pointer', color: '#F87171', display: 'flex', alignItems: 'center',
                gap: 10, fontSize: 13, fontFamily: 'inherit'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={14}/> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}