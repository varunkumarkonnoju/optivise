import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
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
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2"/><path d="M10 22 L16 10 L22 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 18h8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <span className="logo-text">Optivise</span>
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