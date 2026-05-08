import { useEffect, useState, useCallback } from 'react'
import { dashboardApi } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts'
import {
  TrendingUp, TrendingDown, Sparkles, TestTube2, DollarSign,
  Percent, ChevronRight, Search, Package, BarChart3, Star,
  Settings, Zap, Users, CheckCircle, Circle, Calendar, X
} from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import './Dashboard.css'
import OnboardingChecklist from '../components/OnboardingChecklist'
import ConnectStorePrompt from '../components/ConnectStorePrompt'

// ── DATE RANGE OPTIONS ───────────────────────────────────────
const DATE_RANGES = [
  { label: '7 days',  value: 7  },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

// ── COMMAND PALETTE (⌘K) ─────────────────────────────────────
const SEARCH_ITEMS = [
  { label: 'Dashboard',           path: '/dashboard',       icon: BarChart3  },
  { label: 'Product Optimizer',   path: '/products',        icon: Package    },
  { label: 'Analytics',           path: '/analytics',       icon: BarChart3  },
  { label: 'Recommendations',     path: '/recommendations', icon: Star       },
  { label: 'A/B Testing',         path: '/abtesting',       icon: TestTube2  },
  { label: 'AI Assistant',        path: '/assistant',       icon: Sparkles   },
  { label: 'Description History', path: '/history',         icon: ChevronRight },
  { label: 'Settings',            path: '/settings',        icon: Settings   },
  { label: 'Pricing & Billing',   path: '/pricing',         icon: DollarSign },
  { label: 'Customers',           path: '/customers',       icon: Users      },
  { label: 'Automations',         path: '/automations',     icon: Zap        },
]

function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filtered = SEARCH_ITEMS.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  const go = (path) => { navigate(path); onClose() }

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '15vh',
    }} onClick={onClose}>
      <div style={{
        background: '#0D1625', borderRadius: 14,
        border: '1px solid rgba(99,102,241,0.3)',
        width: 540, maxHeight: 400, overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>

        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, features..."
            style={{
              flex: 1, background: 'none', border: 'none',
              outline: 'none', fontSize: 14, color: 'var(--text-primary)',
            }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={14} color="var(--text-muted)" />
          </button>
        </div>

        {/* Results */}
        <div style={{ padding: '8px 0', overflowY: 'auto', maxHeight: 340 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No results found
            </div>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon
              return (
                <button key={i} onClick={() => go(item.path)} style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: 12, padding: '10px 16px', background: 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: 'var(--text-primary)', fontSize: 13,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(99,102,241,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={14} color="var(--purple-light)" />
                  </div>
                  {item.label}
                  <ChevronRight size={12} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                </button>
              )
            })
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)',
        }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}

// ── METRIC CARD ──────────────────────────────────────────────
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
          <AreaChart data={Array.from({length: 7}, () => ({ v: Math.random() * 100 + 50 }))}>
            <defs>
              <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
              fill={`url(#g-${label})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── CUSTOM TOOLTIP ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: '#94A3B8', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name === 'Revenue' ? '$' + Number(p.value || 0).toFixed(0) : p.value?.toFixed(2) + (p.name === 'Conversion' ? '%' : '')}
        </div>
      ))}
    </div>
  )
}

// ── GROWTH SCORE — with sub-metrics ─────────────────────────
function GrowthScore({ score, label }) {
  const r = 54, circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#6366F1' : '#F59E0B'

  const subMetrics = [
    { label: 'Store Performance',        done: score >= 40 },
    { label: 'Marketing Effectiveness',  done: score >= 55 },
    { label: 'Customer Experience',      done: score >= 65 },
    { label: 'SEO & Content',            done: score >= 75 },
  ]

  return (
    <div className="growth-score-wrap">
      <div className="growth-donut">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
          <circle cx="70" cy="70" r={r} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px',
              transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="donut-center">
          <div className="donut-number" style={{ color }}>{score}</div>
          <div className="donut-sub">/100</div>
        </div>
      </div>

      <div className="growth-label" style={{ color }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, textAlign: 'center' }}>
        Better than <strong style={{ color: 'var(--text-secondary)' }}>78% of similar stores</strong>
      </div>

      {/* ── Sub-metrics ── */}
      <div style={{ marginTop: 16, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {subMetrics.map((m, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
          }}>
            {m.done
              ? <CheckCircle size={14} color="#10B981" style={{ flexShrink: 0 }} />
              : <Circle size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            }
            <span style={{ color: m.done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
              {m.label}
            </span>
            {!m.done && (
              <span style={{
                marginLeft: 'auto', fontSize: 10, color: 'var(--amber)',
                background: 'rgba(245,158,11,0.1)', padding: '1px 6px',
                borderRadius: 4, fontWeight: 600,
              }}>
                Improve
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── CUSTOMER SEGMENTS DONUT ──────────────────────────────────
const SEGMENTS = [
  { name: 'VIP',              value: 24, color: '#6366F1' },
  { name: 'Repeat Customers', value: 35, color: '#06B6D4' },
  { name: 'New Customers',    value: 25, color: '#10B981' },
  { name: 'At Risk',          value: 16, color: '#F59E0B' },
]

function CustomerSegments({ totalCustomers = 0 }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div className="card-header-row" style={{ marginBottom: 4 }}>
        <span className="section-title" style={{ marginBottom: 0 }}>Customer Segments</span>
        <a href="/customers" style={{ fontSize: 12, color: 'var(--purple-light)' }}>
          View all
        </a>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        {totalCustomers > 0 ? `${totalCustomers} total customers` : 'Based on purchase behavior'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Donut chart */}
        <div style={{ flexShrink: 0 }}>
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={SEGMENTS} cx={55} cy={55} innerRadius={32}
                outerRadius={55} dataKey="value" paddingAngle={3}>
                {SEGMENTS.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{
                  background: '#0D1625',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, fontSize: 11,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SEGMENTS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: s.color, flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>
                {s.name}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>
                {s.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── MAIN DASHBOARD ───────────────────────────────────────────
export default function DashboardPage() {
  const { formatCurrency } = useSettings()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [dateRange, setDateRange] = useState(30)
  const [cmdOpen, setCmdOpen]   = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    dashboardApi.get().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [dateRange])

  // ⌘K keyboard shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const shopConnected = !!(user?.shopDomain) || (data && data.totalRevenue > 0)

  if (loading) return <div className="spinner" />
  if (!data)   return null

  const today   = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const hour    = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="dashboard">

      {/* ⌘K Command Palette */}
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}

      {/* ── Greeting + Search + Date Range ── */}
      <div className="dash-greeting">
        <div>
          <h1 className="greeting-title">
            {greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="greeting-sub">Here's what's happening with your store today.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* ⌘K Search button */}
          <button
            onClick={() => setCmdOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8, padding: '7px 14px',
              fontSize: 12, color: 'var(--text-muted)',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <Search size={13} />
            Search...
            <span style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 4, padding: '1px 5px',
              fontSize: 10, fontWeight: 600,
              color: 'var(--text-muted)',
            }}>
              ⌘K
            </span>
          </button>

          {/* Date Range Picker */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8, padding: 4,
          }}>
            {DATE_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                style={{
                  background: dateRange === r.value ? 'var(--purple)' : 'none',
                  border: 'none', borderRadius: 6,
                  padding: '4px 10px', fontSize: 11,
                  color: dateRange === r.value ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: dateRange === r.value ? 700 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="date-badge">{today}</div>
        </div>
      </div>

      <OnboardingChecklist />
      {!shopConnected && <ConnectStorePrompt />}

      {/* ── Metric Cards ── */}
      <div className="metrics-grid">
        <MetricCard
          label="Total Revenue" value={formatCurrency(data.totalRevenue)}
          delta={data.revenueDelta} deltaLabel="vs last period"
          icon={DollarSign} color="#6366F1"
        />
        <MetricCard
          label="Conversion Rate" value={data.conversionRate?.toFixed(2)} suffix="%"
          delta={data.conversionDelta} deltaLabel="vs last period"
          icon={Percent} color="#06B6D4"
        />
        <MetricCard
          label="Active A/B Tests" value={data.activeAbTests}
          delta={data.abTestsDelta} deltaLabel="new this week"
          icon={TestTube2} color="#10B981"
        />
        <div className="metric-card card">
          <div className="metric-top">
            <span className="metric-label">AI Suggestions</span>
            <span className="badge badge-new">New</span>
          </div>
          <div className="metric-value">{data.aiSuggestions}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {data.aiSuggestionsNew} new recommendations
          </div>
          <div className="metric-sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={Array.from({length: 7}, () => ({ v: Math.random() * 80 + 40 }))}>
                <defs>
                  <linearGradient id="gAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#F59E0B"
                  strokeWidth={1.5} fill="url(#gAmber)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Middle Row: Growth Score + Actions ── */}
      <div className="mid-row">
        <div className="card growth-card">
          <div className="card-header-row">
            <span className="section-title" style={{ marginBottom: 0 }}>AI Growth Score</span>
          </div>
          <GrowthScore score={data.aiGrowthScore} label={data.growthLabel} />
        </div>

        <div className="card actions-card">
          <div className="card-header-row">
            <span className="section-title" style={{ marginBottom: 0 }}>AI Recommended Actions</span>
            <a href="/recommendations" style={{ fontSize: 12, color: 'var(--purple-light)' }}>
              View all
            </a>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            Based on your store data
          </p>
          <div className="actions-list">
            {data.recommendedActions?.map((a, i) => (
              <div key={i} className="action-item">
                <div className="action-icon" style={{
                  background: a.category === 'product' ? 'var(--purple-dim)'
                    : a.category === 'conversion' ? 'var(--teal-dim)' : 'var(--amber-dim)'
                }}>
                  <Sparkles size={12} style={{
                    color: a.category === 'product' ? 'var(--purple-light)'
                      : a.category === 'conversion' ? 'var(--teal)' : 'var(--amber)'
                  }} />
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

      {/* ── Bottom Row: Chart + Top Products + Customer Segments ── */}
      <div className="bottom-row">
        <div className="card chart-card">
          <div className="card-header-row" style={{ marginBottom: 18 }}>
            <span className="section-title" style={{ marginBottom: 0 }}>
              Performance Overview
            </span>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <LegendDot color="#6366F1" label="Revenue" />
              <LegendDot color="#06B6D4" label="Conversion Rate" />
              <LegendDot color="#F59E0B" label="Sessions" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.revenueChart || []}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label"
                tick={{ fontSize: 11, fill: '#4A5568' }}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#4A5568' }}
                axisLine={false} tickLine={false} width={40}
                tickFormatter={v => formatCurrency(v/1000).replace(/\.\d+/, '') + 'k'} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" name="Revenue" dataKey="revenue"
                stroke="#6366F1" strokeWidth={2} dot={false} />
              <Line type="monotone" name="Conversion" dataKey="conversion"
                stroke="#06B6D4" strokeWidth={2} dot={false} />
              <Line type="monotone" name="Sessions" dataKey="sessions"
                stroke="#F59E0B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card products-card">
          <div className="card-header-row">
            <span className="section-title" style={{ marginBottom: 0 }}>Top Products</span>
            <a href="/products" style={{ fontSize: 12, color: 'var(--purple-light)' }}>
              View all
            </a>
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
                    {p.optimizationStatus === 'optimized' ? '🟢'
                      : p.optimizationStatus === 'needs-attention' ? '🟡' : '🔴'} {p.optimizationStatus}
                  </div>
                </div>
                <div className="product-rev">
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {formatCurrency(p.revenue)}
                  </div>
                  <div className="delta-up">+{p.revenueDelta?.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Customer Segments ── */}
      <CustomerSegments totalCustomers={data.totalCustomers} />

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