import { useEffect, useState } from 'react'
import { analyticsApi } from '../utils/api'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { useSettings } from '../hooks/useSettings'
import './Analytics.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: '#94A3B8', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name === 'Revenue' ? '$' + Number(p.value || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0}) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { formatCurrency, formatDate } = useSettings()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    analyticsApi.get().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />
  if (!data) return null

  const fmt = n => formatCurrency(n || 0)
  const hasOrders = (data.totalOrders || 0) > 0

  // Filter daily data by period
  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const displayData = data.daily
    ? data.daily.slice(Math.max(0, data.daily.length - periodDays))
    : []

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Real data from your Shopify store orders</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['7d', '30d'].map(p => (
            <button key={p} className="btn-ghost"
              onClick={() => setPeriod(p)}
              style={period === p ? { borderColor: 'var(--purple)', color: 'var(--purple-light)', background: 'var(--purple-dim)' } : {}}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* No orders state */}
      {!hasOrders && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 32 }}>📦</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>No orders yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Create a test order in your Shopify admin to see real analytics data here.
              Go to <strong style={{ color: 'var(--purple-light)' }}>Shopify Admin → Orders → Create order</strong>
            </div>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="analytics-stats">
        {[
          { label: 'Total Revenue',    value: fmt(data.totalRevenue),                color: 'var(--purple)',       sub: data.revenueGrowth != null ? (data.revenueGrowth >= 0 ? '+' : '') + data.revenueGrowth + '% vs last week' : 'All time' },
          { label: 'Total Orders',     value: data.totalOrders?.toLocaleString(),    color: 'var(--teal)',         sub: 'Paid orders' },
          { label: 'Avg. Order Value', value: fmt(data.avgOrderValue),               color: 'var(--green)',        sub: 'Per order' },
          { label: 'Best Day',         value: data.bestDay || 'N/A',                 color: '#EC4899',             sub: data.bestDayRevenue > 0 ? fmt(data.bestDayRevenue) + ' revenue' : 'No orders yet' },
        ].map((s, i) => (
          <div key={i} className="card analytics-stat">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value || '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card chart-full">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div className="chart-title">Daily Revenue — Real Shopify Orders</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {hasOrders ? `${data.totalOrders} total orders` : 'No orders yet — add test orders to see data'}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={displayData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4A5568' }} axisLine={false} tickLine={false} interval={Math.floor(displayData.length / 6)} />
            <YAxis tick={{ fontSize: 10, fill: '#4A5568' }} axisLine={false} tickLine={false}
              tickFormatter={v => v > 0 ? formatCurrency((v >= 1000 ? (v/1000).toFixed(1)+'k' : v)) : '$0'} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#6366F1" strokeWidth={2} fill="url(#revGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two-col charts */}
      <div className="charts-two-col">
        <div className="card chart-half">
          <div className="chart-title">Orders per day</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={displayData.slice(-14)} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4A5568' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#4A5568' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar name="Revenue" dataKey="revenue" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-half">
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="chart-title">Store performance summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
              {[
                { label: 'Total revenue',        value: fmt(data.totalRevenue),              color: 'var(--purple)' },
                { label: 'Total orders',          value: (data.totalOrders || 0) + ' orders', color: 'var(--teal)' },
                { label: 'Avg. order value',      value: fmt(data.avgOrderValue),             color: 'var(--green)' },
                { label: 'Revenue this week',     value: fmt(displayData.slice(-7).reduce((s, d) => s + (d.revenue || 0), 0)), color: 'var(--amber)' },
                { label: 'Week-over-week growth', value: (data.revenueGrowth >= 0 ? '+' : '') + (data.revenueGrowth || 0) + '%', color: data.revenueGrowth >= 0 ? 'var(--green)' : 'var(--red)' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Product */}
      {data.topProductsByRevenue?.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div className="chart-title" style={{ marginBottom: 16 }}>💰 Revenue by Product</div>
          {data.topProductsByRevenue.map((p, i) => {
            const maxRev = data.topProductsByRevenue[0].revenue
            const pct = Math.round((p.revenue / maxRev) * 100)
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{p.title}</span>
                  <span style={{ fontSize: 13, color: 'var(--purple-light)', fontWeight: 700 }}>{formatCurrency(p.revenue)}</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg, #6366F1, #06B6D4)', borderRadius: 4, transition: 'width 0.5s ease' }}/>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.orders} orders</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Customer Retention */}
      <div style={{ marginBottom: 16 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="chart-title" style={{ marginBottom: 16 }}>👤 Customer Retention</div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--purple-light)' }}>{data.retentionRate || 0}%</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Repeat Customer Rate</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{data.repeatCustomers || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Repeat Customers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--teal)' }}>{data.totalCustomers || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Customers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{data.bestDayOfWeek || 'N/A'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Best Day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="card" style={{ padding: 24, marginBottom: 16, background: 'rgba(99,102,241,0.03)', border: '1px dashed var(--border)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>🔜 Advanced Analytics — Coming Soon</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            '🌐 Traffic Sources (Google, Social, Direct)',
            '📱 Device Analytics (Mobile vs Desktop)',
            '🎯 Multi-touch Attribution',
            '📊 Audience Segments',
            '🔄 Customer Lifetime Value',
            '📧 Email Campaign Performance',
            '🏷️ Discount Code Analytics',
          ].map((f, i) => (
            <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Data source note */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
        All figures sourced directly from your real Shopify store orders.
      </div>
    </div>
  )
}