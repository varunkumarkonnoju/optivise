import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Dashboard.css'

const API = '/api'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState('revenue')

  useEffect(() => {
    fetch(`${API}/dashboard/summary`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const fmt = (n) => {
    if (!n && n !== 0) return '$0'
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'k'
    return '$' + Math.round(n)
  }

  const impactColor = (impact) => {
    if (!impact) return 'var(--text-muted)'
    const i = impact.toLowerCase()
    if (i === 'high') return 'var(--red, #ef4444)'
    if (i === 'medium') return '#f59e0b'
    return 'var(--green)'
  }

  const categoryIcon = (cat) => {
    if (!cat) return '💡'
    const c = cat.toLowerCase()
    if (c === 'revenue') return '💰'
    if (c === 'optimization') return '🚀'
    if (c === 'testing') return '🧪'
    if (c === 'analytics') return '📊'
    return '💡'
  }

  const chartMax = data?.revenueChart
    ? Math.max(...data.revenueChart.map(p => p.revenue || 0), 1)
    : 1

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
      Loading your dashboard...
    </div>
  )

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
          <p className="dash-subtitle">Here's what's happening with your store today.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => navigate('/analytics')}>📊 Analytics</button>
          <button className="btn-primary" onClick={() => navigate('/products')}>✨ Generate Descriptions</button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="dash-metrics">
        <div className="metric-card" onClick={() => navigate('/analytics')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>$</span>
          </div>
          <div className="metric-value">{fmt(data?.totalRevenue)}</div>
          <div className="metric-delta" style={{ color: (data?.revenueDelta || 0) >= 0 ? 'var(--green)' : '#ef4444' }}>
            {(data?.revenueDelta || 0) >= 0 ? '↑' : '↓'} {Math.abs(data?.revenueDelta || 0)}% vs last month
          </div>
          <svg className="metric-spark" viewBox="0 0 100 30">
            <polyline points="0,25 20,20 40,22 60,15 80,18 100,10" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>

        <div className="metric-card" onClick={() => navigate('/analytics')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-label">Conversion Rate</span>
            <span className="metric-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--green)' }}>%</span>
          </div>
          <div className="metric-value">{(data?.conversionRate || 0).toFixed(2)}%</div>
          <div className="metric-delta" style={{ color: 'var(--green)' }}>
            ↑ {data?.conversionDelta || 0}% vs last month
          </div>
          <svg className="metric-spark" viewBox="0 0 100 30">
            <polyline points="0,20 20,18 40,15 60,12 80,10 100,8" fill="none" stroke="var(--green)" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>

        <div className="metric-card" onClick={() => navigate('/abtesting')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-label">Active A/B Tests</span>
            <span className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>✏</span>
          </div>
          <div className="metric-value">{data?.activeAbTests || 0}</div>
          <div className="metric-delta" style={{ color: 'var(--green)' }}>
            ↑ {data?.abTestsDelta || 0}% new this week
          </div>
          <svg className="metric-spark" viewBox="0 0 100 30">
            <polyline points="0,25 20,20 40,15 60,18 80,12 100,10" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>

        <div className="metric-card" onClick={() => navigate('/recommendations')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-label">AI Suggestions</span>
            {(data?.aiSuggestionsNew || 0) > 0 && (
              <span className="metric-badge">New</span>
            )}
          </div>
          <div className="metric-value">{data?.aiSuggestions || 0}</div>
          <div className="metric-delta" style={{ color: 'var(--purple-light)' }}>
            {data?.aiSuggestions || 0} new recommendations →
          </div>
          <svg className="metric-spark" viewBox="0 0 100 30">
            <polyline points="0,22 20,18 40,12 60,15 80,8 100,5" fill="none" stroke="#a78bfa" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>
      </div>

      {/* Middle Row */}
      <div className="dash-middle">
        {/* AI Growth Score */}
        <div className="dash-score-card">
          <h3 className="card-title">AI Growth Score</h3>
          <div className="growth-score-ring">
            <svg viewBox="0 0 120 120" style={{ width: 140, height: 140 }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(data?.aiGrowthScore || 0) * 3.14} 314`}
                transform="rotate(-90 60 60)"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="score-center">
              <span className="score-number">{data?.aiGrowthScore || 0}</span>
              <span className="score-max">/100</span>
            </div>
          </div>
          <div className="score-label">{data?.growthLabel || 'Getting started'}</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
            You're performing better than 78% of similar stores
          </p>
        </div>

        {/* AI Recommended Actions — FIXED */}
        <div className="dash-actions-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="card-title" style={{ margin: 0 }}>AI Recommended Actions</h3>
            <button
              onClick={() => navigate('/recommendations')}
              style={{ background: 'none', border: 'none', color: 'var(--purple-light)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              View all →
            </button>
          </div>

          {(!data?.recommendedActions || data.recommendedActions.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>All caught up!</div>
              <div style={{ fontSize: 13 }}>No pending actions right now.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.recommendedActions.map((action, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/recommendations')}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{categoryIcon(action.category)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {action.description?.length > 80 ? action.description.substring(0, 80) + '...' : action.description}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: `${impactColor(action.impact)}22`,
                    color: impactColor(action.impact),
                    flexShrink: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {action.impact || 'low'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dash-bottom">
        {/* Revenue Chart */}
        <div className="dash-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="card-title" style={{ margin: 0 }}>Performance Overview</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['revenue', 'conversion', 'sessions'].map(k => (
                <button
                  key={k}
                  onClick={() => setActiveChart(k)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: activeChart === k ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: activeChart === k ? '#a78bfa' : 'var(--text-muted)'
                  }}
                >
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 180, position: 'relative' }}>
            {data?.revenueChart && data.revenueChart.length > 0 ? (
              <svg viewBox={`0 0 ${data.revenueChart.length * 60} 150`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {(() => {
                  const pts = data.revenueChart
                  const vals = pts.map(p => activeChart === 'revenue' ? (p.revenue || 0) : activeChart === 'conversion' ? (p.conversion || 0) * 10 : (p.sessions || 0) / 5)
                  const max = Math.max(...vals, 1)
                  const points = pts.map((_, i) => `${i * 60 + 30},${140 - (vals[i] / max) * 120}`).join(' ')
                  const areaPoints = `30,140 ${points} ${(pts.length - 1) * 60 + 30},140`
                  return (
                    <>
                      <polygon points={areaPoints} fill="url(#chartGrad)"/>
                      <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round"/>
                      {pts.map((p, i) => (
                        <g key={i}>
                          <circle cx={i * 60 + 30} cy={140 - (vals[i] / max) * 120} r="3" fill="#6366f1"/>
                          <text x={i * 60 + 30} y="150" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">{p.label}</text>
                        </g>
                      ))}
                    </>
                  )
                })()}
              </svg>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
                No chart data yet — create some orders in your Shopify store
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="dash-products-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="card-title" style={{ margin: 0 }}>Top Products</h3>
            <button
              onClick={() => navigate('/products')}
              style={{ background: 'none', border: 'none', color: 'var(--purple-light)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              View all →
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, marginTop: -8 }}>By revenue</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data?.topProducts || []).map((p, i) => (
              <div key={i} onClick={() => navigate('/products')} style={{
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '6px 0',
                borderBottom: i < (data.topProducts.length - 1) ? '1px solid rgba(255,255,255,0.04)' : 'none'
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--green)' }}>● optimized</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(p.revenue)}</div>
                  <div style={{ fontSize: 11, color: 'var(--green)' }}>+{p.revenueDelta || 5}%</div>
                </div>
              </div>
            ))}
            {(!data?.topProducts || data.topProducts.length === 0) && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                Connect your Shopify store to see top products
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}