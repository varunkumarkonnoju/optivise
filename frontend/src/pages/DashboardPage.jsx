import { useEffect, useState } from 'react'
import { dashboardApi } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import {
  AreaChart, Area, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { TrendingUp, TrendingDown, Sparkles, TestTube2, DollarSign, Percent, ChevronRight, ExternalLink } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import './Dashboard.css'


function MetricCard({ label, value, delta, deltaLabel, icon: Icon, color, suffix = '' }) {
  const up = delta >= 0
  return (
    <div className="metric-card card">
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <div className="metric-icon" style={{ background: color + '22', color }}>
          <Icon size={14} />
        </div>
      </div>
      <div className="metric-value">{value}{suffix}</div>
      <div className={up ? 'delta-up' : 'delta-down'} style={{ marginTop: 6 }}>
        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {' '}{up ? '+' : ''}{delta}% {deltaLabel}
      </div>
      <div className="metric-sparkline">
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart data={Array.from({length: 7}, (_, i) => ({ v: Math.random() * 100 + 50 }))}>
            <defs>
              <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g-${label})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: '#94A3B8', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name === 'Revenue' ? formatCurrency(p.value) : p.value?.toFixed(2) + (p.name === 'Conversion' ? '%' : '')}
        </div>
      ))}
    </div>
  )
}

function GrowthScore({ score, label }) {
  const r = 54, circ = 2 * Math.PI * r
  const pct = score / 100
  const offset = circ * (1 - pct)
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#6366F1' : '#F59E0B'
  return (
    <div className="growth-score-wrap">
      <div className="growth-donut">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
          <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="donut-center">
          <div className="donut-number" style={{ color }}>{score}</div>
          <div className="donut-sub">/100</div>
        </div>
      </div>
      <div className="growth-label" style={{ color }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
        You're performing better than<br />
        <strong style={{ color: 'var(--text-secondary)' }}>78% of similar stores</strong>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { formatCurrency } = useSettings()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    dashboardApi.get().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />
  if (!data) return null

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div className="dash-greeting">
        <div>
          <h1 className="greeting-title">{greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
          <p className="greeting-sub">Here's what's happening with your store today.</p>
        </div>
        <div className="date-badge">{today}</div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <MetricCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} delta={data.revenueDelta} deltaLabel="vs last month" icon={DollarSign} color="#6366F1" />
        <MetricCard label="Conversion Rate" value={data.conversionRate?.toFixed(2)} suffix="%" delta={data.conversionDelta} deltaLabel="vs last month" icon={Percent} color="#06B6D4" />
        <MetricCard label="Active A/B Tests" value={data.activeAbTests} delta={data.abTestsDelta} deltaLabel="new this week" icon={TestTube2} color="#10B981" />
        <div className="metric-card card" style={{ position: 'relative' }}>
          <div className="metric-top">
            <span className="metric-label">AI Suggestions</span>
            <span className="badge badge-new">New</span>
          </div>
          <div className="metric-value">{data.aiSuggestions}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{data.aiSuggestionsNew} new recommendations</div>
          <div className="metric-sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={Array.from({length: 7}, () => ({ v: Math.random() * 80 + 40 }))}>
                <defs><linearGradient id="gAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient></defs>
                <Area type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={1.5} fill="url(#gAmber)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Row: Growth Score + Recommended Actions */}
      <div className="mid-row">
        {/* AI Growth Score */}
        <div className="card growth-card">
          <div className="card-header-row">
            <span className="section-title" style={{ marginBottom: 0 }}>AI Growth Score</span>
          </div>
          <GrowthScore score={data.aiGrowthScore} label={data.growthLabel} />
        </div>

        {/* Recommended Actions */}
        <div className="card actions-card">
          <div className="card-header-row">
            <span className="section-title" style={{ marginBottom: 0 }}>AI Recommended Actions</span>
            <a href="/recommendations" style={{ fontSize: 12, color: 'var(--purple-light)' }}>View all</a>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Based on your store data</p>
          <div className="actions-list">
            {data.recommendedActions?.map((a, i) => (
              <div key={i} className="action-item">
                <div className="action-icon" style={{ background: a.category === 'product' ? 'var(--purple-dim)' : a.category === 'conversion' ? 'var(--teal-dim)' : 'var(--amber-dim)' }}>
                  <Sparkles size={12} style={{ color: a.category === 'product' ? 'var(--purple-light)' : a.category === 'conversion' ? 'var(--teal)' : 'var(--amber)' }} />
                </div>
                <div className="action-body">
                  <div className="action-title">{a.title}</div>
                  <div className="action-desc">{a.description}</div>
                </div>
                <span className={`badge badge-${a.impact?.toLowerCase()}`}>{a.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart + Top Products */}
      <div className="bottom-row">
        <div className="card chart-card">
          <div className="card-header-row" style={{ marginBottom: 18 }}>
            <span className="section-title" style={{ marginBottom: 0 }}>Performance Overview</span>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <LegendDot color="#6366F1" label="Revenue" />
              <LegendDot color="#06B6D4" label="Conversion Rate" />
              <LegendDot color="#F59E0B" label="Sessions" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.revenueChart || []} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4A5568' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#4A5568' }} axisLine={false} tickLine={false} width={40} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" name="Revenue" dataKey="revenue" stroke="#6366F1" strokeWidth={2} dot={false} />
              <Line type="monotone" name="Conversion" dataKey="conversion" stroke="#06B6D4" strokeWidth={2} dot={false} />
              <Line type="monotone" name="Sessions" dataKey="sessions" stroke="#F59E0B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card products-card">
          <div className="card-header-row">
            <span className="section-title" style={{ marginBottom: 0 }}>Top Products</span>
            <a href="/products" style={{ fontSize: 12, color: 'var(--purple-light)' }}>View all</a>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>By revenue</p>
          <div className="products-list">
            {data.topProducts?.map((p, i) => (
              <div key={i} className="product-row">
                <img src={p.imageUrl} alt={p.title} className="product-thumb"
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
                />
                <div className="product-thumb-fallback" style={{ display: 'none' }}>📦</div>
                <div className="product-info">
                  <div className="product-name">{p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {p.optimizationStatus === 'optimized' ? '🟢' : p.optimizationStatus === 'needs-attention' ? '🟡' : '🔴'} {p.optimizationStatus}
                  </div>
                </div>
                <div className="product-rev">
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(p.revenue)}</div>
                  <div className="delta-up">+{p.revenueDelta?.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      {label}
    </div>
  )
}