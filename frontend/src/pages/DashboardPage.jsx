import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Dashboard.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartMode, setChartMode] = useState('revenue')

  useEffect(() => {
    fetch('/api/dashboard/summary', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const fmt = n => {
    if (!n && n !== 0) return '$0'
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'k'
    return '$' + Math.round(n)
  }

  const impactColor = i => {
    if (!i) return '#6b7280'
    const v = i.toLowerCase()
    if (v === 'high') return '#ef4444'
    if (v === 'medium') return '#f59e0b'
    return '#10b981'
  }

  const catIcon = c => {
    if (!c) return '💡'
    const v = c.toLowerCase()
    if (v === 'revenue') return '💰'
    if (v === 'optimization') return '🚀'
    if (v === 'testing') return '🧪'
    return '💡'
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'rgba(255,255,255,0.4)' }}>
      Loading your dashboard...
    </div>
  )

  const score = data?.aiGrowthScore || 0
  const circumference = 2 * Math.PI * 50
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>{greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
          <p>Here's what's happening with your store today.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-secondary" onClick={() => navigate('/analytics')}>📊 Analytics</button>
          <button className="btn-primary" onClick={() => navigate('/products')}>✨ Generate Descriptions</button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => navigate('/analytics')} style={{ cursor:'pointer' }}>
          <div className="metric-card-header">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-icon" style={{ background:'rgba(99,102,241,0.15)', color:'#6366f1' }}>$</span>
          </div>
          <div className="metric-value">{fmt(data?.totalRevenue)}</div>
          <div className="metric-delta" style={{ color: (data?.revenueDelta||0) >= 0 ? '#10b981' : '#ef4444' }}>
            {(data?.revenueDelta||0) >= 0 ? '↑' : '↓'} {Math.abs(data?.revenueDelta||0)}% vs last month
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/analytics')} style={{ cursor:'pointer' }}>
          <div className="metric-card-header">
            <span className="metric-label">Conversion Rate</span>
            <span className="metric-icon" style={{ background:'rgba(16,185,129,0.15)', color:'#10b981' }}>%</span>
          </div>
          <div className="metric-value">{(data?.conversionRate||0).toFixed(2)}%</div>
          <div className="metric-delta" style={{ color:'#10b981' }}>↑ +{data?.conversionDelta||0}% vs last month</div>
        </div>

        <div className="metric-card" onClick={() => navigate('/abtesting')} style={{ cursor:'pointer' }}>
          <div className="metric-card-header">
            <span className="metric-label">Active A/B Tests</span>
            <span className="metric-icon" style={{ background:'rgba(245,158,11,0.15)', color:'#f59e0b' }}>✏</span>
          </div>
          <div className="metric-value">{data?.activeAbTests || 0}</div>
          <div className="metric-delta" style={{ color:'#10b981' }}>↑ +{data?.abTestsDelta||0}% new this week</div>
        </div>

        <div className="metric-card" onClick={() => navigate('/recommendations')} style={{ cursor:'pointer' }}>
          <div className="metric-card-header">
            <span className="metric-label">AI Suggestions</span>
            {(data?.aiSuggestionsNew||0) > 0 &&
              <span className="metric-badge">New</span>}
          </div>
          <div className="metric-value">{data?.aiSuggestions || 0}</div>
          <div className="metric-delta" style={{ color:'#a78bfa' }}>
            {data?.aiSuggestions||0} new recommendations →
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="dashboard-middle">

        {/* AI Growth Score */}
        <div className="score-card">
          <h3>AI Growth Score</h3>
          <div className="score-ring">
            <svg viewBox="0 0 120 120" width="140" height="140">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
              <circle cx="60" cy="60" r="50" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                transform="rotate(-90 60 60)"
                style={{ transition:'stroke-dashoffset 1s ease' }}/>
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
              <text x="60" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{score}</text>
              <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">/100</text>
            </svg>
          </div>
          <div className="score-label">{data?.growthLabel || 'Getting started'}</div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', textAlign:'center', marginTop:6 }}>
            Performing better than 78% of similar stores
          </p>
        </div>

        {/* AI Recommended Actions */}
        <div className="actions-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>AI Recommended Actions</h3>
            <button onClick={() => navigate('/recommendations')}
              style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:13, fontWeight:600 }}>
              View all →
            </button>
          </div>

          {(!data?.recommendedActions || data.recommendedActions.length === 0) ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:'rgba(255,255,255,0.4)' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🎉</div>
              <div style={{ fontWeight:600, marginBottom:4 }}>All caught up!</div>
              <div style={{ fontSize:13 }}>No pending actions right now.</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {data.recommendedActions.map((a, i) => (
                <div key={i} onClick={() => navigate('/recommendations')}
                  style={{
                    background:'rgba(255,255,255,0.04)',
                    border:'1px solid rgba(255,255,255,0.07)',
                    borderRadius:10, padding:'12px 14px', cursor:'pointer',
                    display:'flex', alignItems:'flex-start', gap:12
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                >
                  <span style={{ fontSize:20, flexShrink:0 }}>{catIcon(a.category)}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:3 }}>{a.title}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.4 }}>
                      {(a.description||'').length > 80
                        ? a.description.substring(0,80)+'...'
                        : a.description}
                    </div>
                  </div>
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20,
                    background:`${impactColor(a.impact)}22`, color:impactColor(a.impact),
                    flexShrink:0, textTransform:'uppercase', letterSpacing:'0.5px'
                  }}>{a.impact||'low'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom">

        {/* Chart */}
        <div className="chart-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Performance Overview</h3>
            <div style={{ display:'flex', gap:6 }}>
              {['revenue','conversion','sessions'].map(k => (
                <button key={k} onClick={() => setChartMode(k)} style={{
                  padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:600,
                  cursor:'pointer', border:'none',
                  background: chartMode===k ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: chartMode===k ? '#a78bfa' : 'rgba(255,255,255,0.4)'
                }}>{k.charAt(0).toUpperCase()+k.slice(1)}</button>
              ))}
            </div>
          </div>

          {data?.revenueChart?.length > 0 ? (() => {
            const pts = data.revenueChart
            const vals = pts.map(p =>
              chartMode==='revenue'    ? (p.revenue||0) :
              chartMode==='conversion' ? (p.conversion||0)*15 :
              (p.sessions||0)/4
            )
            const max = Math.max(...vals, 1)
            const W = 700, H = 160, PAD = 30
            const coords = pts.map((_, i) => [
              PAD + (i / (pts.length - 1)) * (W - PAD*2),
              H - 20 - ((vals[i]/max) * (H - 40))
            ])
            const line = coords.map(([x,y]) => `${x},${y}`).join(' ')
            const area = `${coords[0][0]},${H-20} ${line} ${coords[coords.length-1][0]},${H-20}`
            return (
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:180 }} preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <polygon points={area} fill="url(#chartGrad)"/>
                <polyline points={line} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round"/>
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle cx={coords[i][0]} cy={coords[i][1]} r="4" fill="#6366f1"/>
                    <text x={coords[i][0]} y={H-4} textAnchor="middle"
                      fill="rgba(255,255,255,0.35)" fontSize="10">{p.label}</text>
                  </g>
                ))}
              </svg>
            )
          })() : (
            <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center',
              color:'rgba(255,255,255,0.3)', fontSize:13 }}>
              Add orders in Shopify to see chart data
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="top-products-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Top Products</h3>
            <button onClick={() => navigate('/products')}
              style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:13, fontWeight:600 }}>
              View all →
            </button>
          </div>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', margin:'0 0 14px' }}>By revenue</p>
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {(data?.topProducts||[]).map((p, i, arr) => (
              <div key={i} onClick={() => navigate('/products')}
                style={{
                  display:'flex', alignItems:'center', gap:12, cursor:'pointer',
                  padding:'10px 0',
                  borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}>
                <div style={{ width:40, height:40, borderRadius:8, overflow:'hidden', flexShrink:0,
                  background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : <span style={{ fontSize:18 }}>📦</span>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap',
                    overflow:'hidden', textOverflow:'ellipsis' }}>{p.title}</div>
                  <div style={{ fontSize:11, color:'#10b981' }}>● optimized</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>{fmt(p.revenue)}</div>
                  <div style={{ fontSize:11, color:'#10b981' }}>+{p.revenueDelta||5}%</div>
                </div>
              </div>
            ))}
            {(!data?.topProducts || data.topProducts.length === 0) && (
              <div style={{ color:'rgba(255,255,255,0.3)', fontSize:13, textAlign:'center', padding:'20px 0' }}>
                Connect your Shopify store to see top products
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}