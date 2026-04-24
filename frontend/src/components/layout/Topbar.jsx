import { Bell, Plus, Search, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'
import './Layout.css'

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth()
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile menu button */}
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
        <button className="btn-primary" style={{ height: 36 }}>
          <Plus size={14} /> New
        </button>
        <button className="notif-btn">
          <Bell size={15} />
          <span className="notif-dot" />
        </button>
        <div className="topbar-user">
          <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 13, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
            {user?.name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="topbar-name">{user?.name || '...'}</div>
            <div className="topbar-role">{user?.role || ''}</div>
          </div>
        </div>
      </div>
    </div>
  )
}