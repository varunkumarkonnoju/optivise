import { useEffect, useState } from 'react'
import {
  Users, Search, Mail, Phone, MapPin, ShoppingBag,
  DollarSign, Clock, AlertCircle, ChevronRight, X,
  Send, CheckCircle, ArrowLeft, Package, TrendingUp,
  ShoppingCart, Star, Filter
} from 'lucide-react'
import './Customers.css'

const token = () => localStorage.getItem('token')

const api = {
  getCustomers:      () => fetch('/api/customers', { headers: { Authorization: 'Bearer ' + token() } }).then(r => r.json()),
  getAbandonedCarts: () => fetch('/api/customers/abandoned-carts', { headers: { Authorization: 'Bearer ' + token() } }).then(r => r.json()),
  getCustomer:       (id) => fetch(`/api/customers/${id}`, { headers: { Authorization: 'Bearer ' + token() } }).then(r => r.json()),
  sendReminder:      (email, productTitle, cartUrl) => fetch('/api/customers/send-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token() },
    body: JSON.stringify({ email, productTitle, cartUrl })
  }).then(r => r.json()),
}

// ── CUSTOMER SEGMENT BADGE ────────────────────────────────────
function SegmentBadge({ segment }) {
  const cfg = {
    vip:     { label: '⭐ VIP',      color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
    repeat:  { label: '🔄 Repeat',   color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
    new:     { label: '🆕 New',      color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    at_risk: { label: '⚠️ At Risk',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  }
  const c = cfg[segment] || cfg.new
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: c.color, background: c.bg, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  )
}

function getSegment(customer) {
  const spent = parseFloat(customer.total_spent || 0)
  const orders = customer.orders_count || 0

  // Days since last activity (for at-risk detection)
  const lastActive = customer.last_order_date || customer.updated_at
  const daysSince = lastActive
    ? Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000)
    : 9999

  // At Risk: ordered before but has gone quiet (90+ days)
  if (orders >= 1 && daysSince > 90) return 'at_risk'

  // VIP: genuinely loyal AND valuable — repeat buyer with high spend
  if (orders >= 3 && spent >= 500) return 'vip'

  // Repeat: ordered more than once
  if (orders > 1) return 'repeat'

  // New: a single order
  return 'new'
}

// ── CUSTOMER DETAIL PANEL ─────────────────────────────────────
function CustomerDetail({ customer, onClose }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCustomer(customer.id)
      .then(data => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [customer.id])

  const segment = getSegment(customer)
  const totalSpent = parseFloat(customer.total_spent || 0)
  const ordersCount = customer.orders_count || 0
  const avgOrder = ordersCount > 0 ? totalSpent / ordersCount : 0

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: 480, height: '100%', background: '#0D1625',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        overflowY: 'auto', padding: '24px',
        animation: 'slideIn 0.25s ease',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
            <ArrowLeft size={14} /> Back to customers
          </button>
          <SegmentBadge segment={segment} />
        </div>

        {/* Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
            {customer.first_name?.[0] || customer.email?.[0] || '?'}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              {customer.first_name} {customer.last_name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Customer since {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 10 }}>CONTACT</div>
          {[
            { icon: Mail, label: customer.email },
            { icon: Phone, label: customer.phone || 'No phone' },
            { icon: MapPin, label: customer.default_address
              ? `${customer.default_address.city || ''}, ${customer.default_address.country || ''}`.replace(/^,\s*/, '') || 'No location'
              : 'No location'
            },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              <Icon size={13} color="var(--text-muted)" />
              {label}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Total Spent', value: `$${totalSpent.toFixed(0)}`, color: '#6366F1' },
            { label: 'Orders', value: ordersCount, color: '#10B981' },
            { label: 'Avg Order', value: `$${avgOrder.toFixed(0)}`, color: '#06B6D4' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {customer.tags && customer.tags.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 8 }}>TAGS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {customer.tags.split(',').filter(Boolean).map((tag, i) => (
                <span key={i} style={{ fontSize: 11, color: 'var(--purple-light)', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 20 }}>{tag.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {/* Order history */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 10 }}>
            ORDER HISTORY ({ordersCount})
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 12 }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 12 }}>No orders yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {orders.slice(0, 10).map((order, i) => (
                <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>#{order.order_number || order.id}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>${parseFloat(order.total_price || 0).toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{order.financial_status}</div>
                    </div>
                  </div>
                  {order.line_items?.slice(0, 3).map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                      <Package size={10} color="var(--text-muted)" />
                      {item.title} × {item.quantity}
                    </div>
                  ))}
                  {order.line_items?.length > 3 && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>+{order.line_items.length - 3} more items</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ABANDONED CART PANEL ─────────────────────────────────────
function AbandonedCartsPanel({ carts, onSendReminder }) {
  const [sending, setSending] = useState({})
  const [sent, setSent] = useState({})

  const handleSend = async (cart) => {
    const key = cart.id
    setSending(s => ({ ...s, [key]: true }))
    try {
      const email = cart.email || cart.billing_address?.email
      const productTitle = cart.line_items?.[0]?.title || 'your cart items'
      const cartUrl = cart.abandoned_checkout_url || ''
      await onSendReminder(email, productTitle, cartUrl)
      setSent(s => ({ ...s, [key]: true }))
    } catch (e) { console.error(e) }
    finally { setSending(s => ({ ...s, [key]: false })) }
  }

  if (!carts || carts.length === 0) return null

  return (
    <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <ShoppingCart size={16} color="#F59E0B" />
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {carts.length} Abandoned Cart{carts.length > 1 ? 's' : ''} — Send Reminders
        </span>
        <span style={{ fontSize: 11, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
          ${carts.reduce((s, c) => s + parseFloat(c.total_price || 0), 0).toFixed(0)} recoverable
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {carts.slice(0, 5).map((cart, i) => {
          const email = cart.email || cart.billing_address?.email || 'Unknown'
          const product = cart.line_items?.[0]?.title || 'Items'
          const total = parseFloat(cart.total_price || 0).toFixed(2)
          const timeAgo = cart.updated_at
            ? Math.floor((Date.now() - new Date(cart.updated_at).getTime()) / 3600000) + 'h ago'
            : 'recently'
          const isSent = sent[cart.id]
          const isSending = sending[cart.id]

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 14px', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Left: {product.length > 30 ? product.substring(0, 30) + '...' : product} · ${total} · {timeAgo}
                </div>
              </div>
              {isSent ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10B981', fontWeight: 700 }}>
                  <CheckCircle size={12} /> Sent!
                </div>
              ) : (
                <button
                  onClick={() => handleSend(cart)}
                  disabled={isSending}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F59E0B', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#fff', cursor: isSending ? 'not-allowed' : 'pointer', opacity: isSending ? 0.7 : 1, flexShrink: 0 }}
                >
                  <Send size={11} />
                  {isSending ? 'Sending...' : 'Send Reminder'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── MAIN CUSTOMERS PAGE ──────────────────────────────────────
export default function CustomersPage() {
  const [customers, setCustomers]       = useState([])
  const [carts, setCarts]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [cartsLoading, setCartsLoading] = useState(true)
  const [search, setSearch]             = useState('')
  const [filter, setFilter]             = useState('all')
  const [sortBy, setSortBy]             = useState('spent')
  const [selected, setSelected]         = useState(null)
  const [error, setError]               = useState('')

  useEffect(() => {
    api.getCustomers()
      .then(data => setCustomers(Array.isArray(data) ? data : data.customers || []))
      .catch(() => setError('Failed to load customers. Make sure your Shopify store is connected.'))
      .finally(() => setLoading(false))

    // Abandoned carts fetch disabled — endpoint requires Shopify checkout scope not currently granted.
    // Re-enable when scopes + compliant reminder emails are in place.
    setCartsLoading(false)
  }, [])

  const handleSendReminder = async (email, productTitle, cartUrl) => {
    return await api.sendReminder(email, productTitle, cartUrl)
  }

  // Filter + search + sort
  const filtered = customers
    .filter(c => {
      const name = `${c.first_name || ''} ${c.last_name || ''} ${c.email || ''}`.toLowerCase()
      const matchSearch = name.includes(search.toLowerCase())
      const seg = getSegment(c)
      const matchFilter = filter === 'all' || seg === filter
      return matchSearch && matchFilter
    })
    .sort((a, b) => {
      if (sortBy === 'spent')  return (b.total_spent || 0) - (a.total_spent || 0)
      if (sortBy === 'orders') return (b.orders_count || 0) - (a.orders_count || 0)
      if (sortBy === 'recent') return new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
      return 0
    })

  const totalRevenue  = customers.reduce((s, c) => s + parseFloat(c.total_spent || 0), 0)
  const totalOrders   = customers.reduce((s, c) => s + (c.orders_count || 0), 0)
  const avgLTV        = customers.length > 0 ? totalRevenue / customers.length : 0
  const vipCount      = customers.filter(c => getSegment(c) === 'vip').length
  const atRiskCount   = customers.filter(c => getSegment(c) === 'at_risk').length

  if (loading) return <div className="spinner" />

  return (
    <div style={{ padding: '0 0 40px' }}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-sub">Real customer data from your Shopify store</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
          Live Shopify Data
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Customers', value: customers.length, color: '#6366F1', icon: Users },
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, color: '#10B981', icon: DollarSign },
          { label: 'Avg Lifetime Value', value: `$${avgLTV.toFixed(0)}`, color: '#06B6D4', icon: TrendingUp },
          { label: 'VIP Customers', value: vipCount, color: '#F59E0B', icon: Star },
          { label: 'At Risk', value: atRiskCount, color: '#EF4444', icon: AlertCircle },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</span>
                <Icon size={13} color={s.color} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Abandoned carts — hidden until Shopify checkout scope + email consent are in place */}
      {/* {!cartsLoading && carts.length > 0 && (
        <AbandonedCartsPanel carts={carts} onSendReminder={handleSendReminder} />
      )} */}
      {/* Search + filter + sort */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
          <Search size={13} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={12} /></button>}
        </div>

        {/* Segment filter */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'vip', label: '⭐ VIP' },
            { id: 'repeat', label: '🔄 Repeat' },
            { id: 'new', label: '🆕 New' },
            { id: 'at_risk', label: '⚠️ At Risk' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              background: filter === f.id ? 'var(--purple)' : 'none',
              border: 'none', borderRadius: 6, padding: '4px 10px',
              fontSize: 11, color: filter === f.id ? 'white' : 'var(--text-muted)',
              cursor: 'pointer', fontWeight: filter === f.id ? 700 : 400,
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none' }}>
          <option value="spent">Sort: Total Spent</option>
          <option value="orders">Sort: Order Count</option>
          <option value="recent">Sort: Recent Activity</option>
        </select>
      </div>

      {/* Customer count */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
        Showing {filtered.length} of {customers.length} customers
      </div>

      {/* Customer table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px', gap: 12, padding: '10px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          <div>Customer</div>
          <div>Contact</div>
          <div>Spent</div>
          <div>Orders</div>
          <div>Segment</div>
          <div></div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <Users size={44} color="var(--purple-light)" style={{ opacity: 0.4, marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {customers.length === 0 ? 'No customers yet' : 'No customers match your search'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {customers.length === 0
                ? 'Customer data will appear here once you start getting Shopify orders.'
                : 'Try a different search or filter.'}
            </div>
          </div>
        )}

        {/* Rows */}
        {filtered.map((customer, i) => {
          const segment = getSegment(customer)
          const spent = parseFloat(customer.total_spent || 0)
          const lastOrder = customer.last_order_date || customer.updated_at
          return (
            <div key={customer.id || i}
              onClick={() => setSelected(customer)}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px',
                gap: 12, padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer', transition: 'background 0.15s',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
            >
              {/* Name + avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                  {customer.first_name?.[0] || customer.email?.[0] || '?'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {customer.first_name || ''} {customer.last_name || ''}
                    {!customer.first_name && !customer.last_name && <span style={{ color: 'var(--text-muted)' }}>Unknown</span>}
                  </div>
                  {lastOrder && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      Last active {new Date(lastOrder).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', alignSelf: 'center' }}>
                {customer.email || 'No email'}
              </div>

              {/* Spent */}
              <div style={{ fontSize: 13, fontWeight: 700, color: spent > 100 ? '#10B981' : 'var(--text-primary)', alignSelf: 'center' }}>
                ${spent.toFixed(0)}
              </div>

              {/* Orders */}
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', alignSelf: 'center' }}>
                {customer.orders_count || 0} orders
              </div>

              {/* Segment */}
              <div style={{ alignSelf: 'center' }}>
                <SegmentBadge segment={segment} />
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Customer detail panel */}
      {selected && (
        <CustomerDetail customer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}