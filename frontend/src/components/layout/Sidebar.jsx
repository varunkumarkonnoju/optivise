import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import OptiviseLogo from '../OptiviseLogo'
import {
  LayoutDashboard, Sparkles, Package, TestTube2,
  Star, BarChart3, Zap, LogOut, ChevronRight, CreditCard
} from 'lucide-react'
import './Layout.css'

const nav = [
  { label: 'Dashboard',         path: '/dashboard',              icon: LayoutDashboard },
  { label: 'AI Insights',        path: '/insights',      icon: Sparkles },
  { label: 'Product Optimizer', path: '/products',      icon: Package },
  { label: 'A/B Testing',       path: '/abtesting',     icon: TestTube2 },
  { label: 'Recommendations',   path: '/recommendations',icon: Star },
  { label: 'Analytics',         path: '/analytics',     icon: BarChart3 },
  { label: 'Automations',        path: '/automations',   icon: Zap },
  { label: 'Pricing & Billing',  path: '/pricing',       icon: CreditCard },
]

export default function Sidebar({ className = '' }) {
  const { user, logout } = useAuth()

  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.4)', flexShrink: 0
        }}>
          <svg viewBox="0 0 100 100" width="22" height="22">
            <circle cx="50" cy="42" r="22" fill="none" stroke="white" strokeWidth="6"/>
            <circle cx="50" cy="42" r="13" fill="#4F46E5"/>
            <rect x="30" y="46" width="6" height="10" rx="1" fill="rgba(255,255,255,0.4)"/>
            <rect x="38" y="41" width="6" height="15" rx="1" fill="rgba(255,255,255,0.6)"/>
            <rect x="46" y="35" width="6" height="21" rx="1" fill="white"/>
            <rect x="54" y="38" width="6" height="18" rx="1" fill="rgba(255,255,255,0.6)"/>
            <rect x="62" y="31" width="6" height="25" rx="1" fill="white"/>
            <polyline points="33,43 41,37 49,31 57,34 65,28" fill="none" stroke="#96BF48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="65" cy="28" r="3" fill="#96BF48"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1 }}>Optivise</div>
          <div style={{ fontSize: 8, color: '#96BF48', fontWeight: 700, letterSpacing: '1.5px', lineHeight: 1.4 }}>FOR SHOPIFY</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map(({ label, path, icon: Icon }) => (
          <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-assistant">
        <div className="assistant-card">
          <div className="assistant-header">
            <div className="ai-dot" /><span>AI Assistant</span>
          </div>
          <p className="assistant-hint">Ask anything about your store...</p>
          <NavLink to="/assistant" className="assistant-link">
            Open chat <ChevronRight size={12} />
          </NavLink>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0) || '?'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || '...'}</div>
            <div className="user-role">{user?.role || 'Store Owner'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Log out"><LogOut size={15} /></button>
      </div>
    </aside>
  )
}