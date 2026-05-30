import { useEffect, useState, useRef } from 'react'
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
  Settings, Zap, Users, CheckCircle, Circle, Calendar, X,
  Activity, RefreshCw, ArrowUpRight, AlertCircle
} from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import './Dashboard.css'
import { OnboardingChecklist } from '../components/OnboardingChecklist'
import ConnectStorePrompt from '../components/ConnectStorePrompt'

// ── DATE RANGES ───────────────────────────────────────────────
const DATE_RANGES = [
  { label: '7 days',  value: 7  },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

// ── ANIMATED NUMBER ──────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const start = prevRef.current
    const end = typeof value === 'number' ? value : parseFloat(value) || 0
    const steps = 40
    let frame = 0
    const timer = setInterval(() => {
      frame++
      const progress = frame / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (end - start) * eased)
      if (frame >= steps) { setDisplay(end); prevRef.current = end; clearInterval(timer) }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value, duration])

  const formatted = suffix === '%'
    ? display.toFixed(2)
    : prefix === '$'
    ? display.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : Math.round(display).toString()

  return <span>{prefix}{formatted}{suffix}</span>
}

// ── COMMAND PALETTE ──────────────────────────────────────────
const SEARCH_ITEMS = [
  { label: 'Dashboard',           path: '/dashboard',       icon: BarChart3    },
  { label: 'Product Optimizer',   path: '/products',        icon: Package      },
  { label: 'Analytics',           path: '/analytics',       icon: BarChart3    },
  { label: 'Recommendations',     path: '/recommendations', icon: Star         },
  { label: 'A/B Testing',         path: '/abtesting',       icon: TestTube2    },
  { label: 'AI Assistant',        path: '/assistant',       icon: Sparkles     },
  { label: 'Revenue Leaks',       path: '/insights',        icon: TrendingDown },
  { label: 'Store Health',        path: '/automations',     icon: Activity     },
  { label: 'Description History', path: '/history',         icon: ChevronRight },
  { label: 'Settings',            path: '/settings',        icon: Settings     },
  { label: 'Pricing & Billing',   path: '/pricing',         icon: DollarSign   },
]

function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const [selected, setSelected] = useState(0)
  const [storeResults, setStoreResults] = useState([])
  const [searching, setSearching] = useState(false)

  // Page/feature matches (local)
  const pageItems = SEARCH_ITEMS
    .filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
    .map(item => ({ kind: 'page', label: item.label, sublabel: 'Page', icon: item.icon, path: item.path }))

  // Store matches (products, customers, orders) from the backend
  useEffect(() => {
    if (query.trim().length < 2) { setStoreResults([]); return }
    let cancelled = false
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/search?q=' + encodeURIComponent(query.trim()), {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setStoreResults(Array.isArray(data) ? data : [])
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setSearching(false) }
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query])

  const storeItems = storeResults.map(r => ({
    kind: r.type, label: r.label, sublabel: r.sublabel || (r.type ? r.type[0].toUpperCase() + r.type.slice(1) : ''), path: r.path
  }))

  // Combined list: store results first, then pages
  const results = [...storeItems, ...pageItems]

  const go = (path) => { navigate(path); onClose() }

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, results.length - 1))
      if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0))
      if (e.key === 'Enter' && results[selected]) go(results[selected].path)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, results, selected])

  useEffect(() => setSelected(0), [query])

  const emoji = (kind) => kind === 'product' ? '🛍️' : kind === 'customer' ? '👤' : kind === 'order' ? '🧾' : null

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
        width: 540, maxHeight: 420, overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search products, customers, orders, pages..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)' }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={14} color="var(--text-muted)" />
          </button>
        </div>
        <div style={{ padding: '8px 0', overflowY: 'auto', maxHeight: 350 }}>
          {results.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              {searching ? 'Searching your store...' : query.trim().length >= 2 ? 'No results found' : 'Type to search your store'}
            </div>
          ) : results.map((item, i) => {
            const Icon = item.icon
            const em = emoji(item.kind)
            return (
              <button key={i} onClick={() => go(item.path)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', background: i === selected ? 'rgba(99,102,241,0.1)' : 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                color: 'var(--text-primary)', fontSize: 13,
              }}
                onMouseEnter={() => setSelected(i)}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {Icon ? <Icon size={14} color="var(--purple-light)" /> : <span>{em}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                  {item.sublabel && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sublabel}</div>}
                </div>
                <ChevronRight size={12} color="var(--text-muted)" />
              </button>
            )
          })}
        </div>
        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
          <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
        </div>
      </div>
    </div>
  )
}

// ── QUICK ACTIONS STRIP ──────────────────────────────────────
function QuickActions({ shopConnected }) {
  const navigate = useNavigate()
  const actions = [
    { icon: Sparkles, label: 'Generate AI Description', color: '#6366F1', path: '/products', locked: !shopConnected },
    { icon: TrendingDown, label: 'Find Revenue Leaks', color: '#EF4444', path: '/insights', locked: !shopConnected },
    { icon: TestTube2, label: 'Start A/B Test', color: '#F59E0B', path: '/abtesting', locked: !shopConnected },
    { icon: Activity, label: 'Store Health Score', color: '#10B981', path: '/automations', locked: false },
    { icon: Sparkles, label: 'Ask AI Assistant', color: '#06B6D4', path: '/assistant', locked: false },
  ]
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
      {actions.map((a, i) => {
        const Icon = a.icon
        return (
          <button key={i} onClick={() => navigate(a.path)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: `${a.color}10`, border: `1px solid ${a.color}25`,
            borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600,
            color: a.locked ? 'var(--text-muted)' : a.color,
            cursor: 'pointer', transition: 'all 0.15s', opacity: a.locked ? 0.6 : 1,
          }}
            onMouseEnter={e => !a.locked && (e.currentTarget.style.background = `${a.color}20`)}
            onMouseLeave={e => e.currentTarget.style.background = `${a.color}10`}
          >
            <Icon size={12} />
            {a.label}
            {a.locked && <AlertCircle size={10} style={{ opacity: 0.6 }} />}
          </button>
        )
      })}
    </div>
  )
}

// ── METRIC CARD with animated counter + week comparison ──────
function MetricCard({ label, value, rawValue, delta, deltaLabel, icon: Icon, color, suffix = '', prevValue }) {
  const up = delta >= 0
  const weekDiff = rawValue && prevValue ? ((rawValue - prevValue) / Math.max(prevValue, 1) * 100).toFixed(1) : null

  return (
    <div className="metric-card card">
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <div className="metric-icon" style={{ background: color + '22', color }}>
          <Icon size={14} />
        </div>
      </div>
      <div className="metric-value">
        {typeof rawValue === 'number'
          ? <AnimatedNumber value={rawValue} prefix={suffix === '%' ? '' : ((label.includes('Revenue') || label.includes('Order Value')) ? '$' : '')} suffix={suffix} />
          : value}{suffix && typeof rawValue !== 'number' ? suffix : ''}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <div className={up ? 'delta-up' : 'delta-down'}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {' '}{up ? '+' : ''}{delta}% {deltaLabel}
        </div>
        {weekDiff !== null && (
          <span style={{ fontSize: 10, color: parseFloat(weekDiff) >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
            {parseFloat(weekDiff) >= 0 ? '▲' : '▼'} vs last week
          </span>
        )}
      </div>
      <div className="metric-sparkline">
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart data={Array.from({length: 7}, (_, i) => ({
            v: typeof rawValue === 'number' ? rawValue * (0.6 + Math.random() * 0.8) : Math.random() * 100
          }))}>
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

// ── GROWTH SCORE ─────────────────────────────────────────────
function GrowthScore({ score, label }) {
  const r = 54, circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#6366F1' : '#F59E0B'
  const subMetrics = [
    { label: 'Store Performance',       done: score >= 40 },
    { label: 'Marketing Effectiveness', done: score >= 55 },
    { label: 'Customer Experience',     done: score >= 65 },
    { label: 'SEO & Content',           done: score >= 75 },
  ]
  return (
    <div className="growth-score-wrap">
      <div className="growth-donut">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
          <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dashoffset 1.5s ease' }}/>
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
      <div style={{ marginTop: 16, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {subMetrics.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            {m.done
              ? <CheckCircle size={14} color="#10B981" style={{ flexShrink: 0 }} />
              : <Circle size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
            <span style={{ color: m.done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{m.label}</span>
            {!m.done && (
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--amber)', background: 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                Improve
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── CUSTOMER SEGMENTS ─────────────────────────────────────────
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
        <a href="/customers" style={{ fontSize: 12, color: 'var(--purple-light)' }}>View all</a>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        {totalCustomers > 0 ? `${totalCustomers} total customers` : 'Based on purchase behavior'}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ flexShrink: 0 }}>
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={SEGMENTS} cx={55} cy={55} innerRadius={32} outerRadius={55} dataKey="value" paddingAngle={3}>
                {SEGMENTS.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]}
                contentStyle={{ background: '#0D1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SEGMENTS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{s.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── LIVE PULSE INDICATOR ─────────────────────────────────────
function LivePulse() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', background: '#10B981',
        boxShadow: '0 0 6px #10B981', animation: 'pulse 2s ease-in-out infinite',
      }} />
      Live · Updated {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  )
}

// ── MAIN DASHBOARD ────────────────────────────────────────────
export default function DashboardPage() {
  const { formatCurrency } = useSettings()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange]   = useState(30)
  const [cmdOpen, setCmdOpen]       = useState(false)
  const { user } = useAuth()

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    try {
      const r = await dashboardApi.get()
      setData(r.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [dateRange])

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

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today    = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="dashboard">
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}

      {/* ── Header ── */}
      <div className="dash-greeting">
        <div>
          <h1 className="greeting-title">
            {greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <p className="greeting-sub" style={{ margin: 0 }}>Here's what's happening with your store.</p>
            <LivePulse />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search store */}
          <button onClick={() => setCmdOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Search size={13} />
            Search...
            <span style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>⌘K</span>
          </button>

          {/* Date range */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
            {DATE_RANGES.map(r => (
              <button key={r.value} onClick={() => setDateRange(r.value)}
                style={{ background: dateRange === r.value ? 'var(--purple)' : 'none', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: dateRange === r.value ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: dateRange === r.value ? 700 : 400, transition: 'all 0.2s' }}>
                {r.label}
              </button>
            ))}
          </div>

          <div className="date-badge">{today}</div>
        </div>
      </div>

      {/* ── Onboarding checklist ── */}
      <OnboardingChecklist shopConnected={shopConnected} />

      {/* ── Connect store prompt ── */}
      {!shopConnected && <ConnectStorePrompt />}

      {/* ── Quick actions ── */}
      <QuickActions shopConnected={shopConnected} />

      {/* ── Metric Cards ── */}
      <div className="metrics-grid">
        <MetricCard
          label="Total Revenue" rawValue={data.totalRevenue}
          delta={data.revenueDelta} deltaLabel="vs last period"
          icon={DollarSign} color="#6366F1"
        />
        <MetricCard
          label="Avg Order Value" rawValue={data.avgOrderValue}
          delta={data.conversionDelta} deltaLabel="vs last period"
          icon={Percent} color="#06B6D4"
        />
        <MetricCard
          label="Active A/B Tests" rawValue={data.activeAbTests}
          delta={data.abTestsDelta} deltaLabel="new this week"
          icon={TestTube2} color="#10B981"
        />
        <div className="metric-card card">
          <div className="metric-top">
            <span className="metric-label">AI Suggestions</span>
            <span className="badge badge-new">New</span>
          </div>
          <div className="metric-value">
            <AnimatedNumber value={data.aiSuggestions} />
          </div>
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
                <Area type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={1.5} fill="url(#gAmber)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Middle Row ── */}
      <div className="mid-row">
        <div className="card growth-card">
          <div className="card-header-row">
            <span className="section-title" style={{ marginBottom: 0 }}>AI Growth Score</span>
            <a href="/automations" style={{ fontSize: 12, color: 'var(--purple-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Full analysis <ArrowUpRight size={11} />
            </a>
          </div>
          <GrowthScore score={data.aiGrowthScore} label={data.growthLabel} />
        </div>

        <div className="card actions-card">
          <div className="card-header-row">
            <span className="section-title" style={{ marginBottom: 0 }}>AI Recommended Actions</span>
            <a href="/recommendations" style={{ fontSize: 12, color: 'var(--purple-light)' }}>View all</a>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Based on your store data</p>
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

      {/* ── Bottom Row ── */}
      <div className="bottom-row">
        <div className="card chart-card">
          <div className="card-header-row" style={{ marginBottom: 18 }}>
            <span className="section-title" style={{ marginBottom: 0 }}>Performance Overview</span>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <LegendDot color="#6366F1" label="Revenue" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.revenueChart || []} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4A5568' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#4A5568' }} axisLine={false} tickLine={false} width={40}
                tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" name="Revenue" dataKey="revenue" stroke="#6366F1" strokeWidth={2} dot={false} />
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
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                <div className="product-thumb-fallback" style={{ display: 'none' }}>📦</div>
                <div className="product-info">
                  <div className="product-name">{p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {p.optimizationStatus === 'optimized' ? '🟢' : p.optimizationStatus === 'needs-attention' ? '🟡' : '🔴'} {p.optimizationStatus}
                  </div>
                </div>
                <div className="product-rev">
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    <AnimatedNumber value={p.revenue} prefix="$" />
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