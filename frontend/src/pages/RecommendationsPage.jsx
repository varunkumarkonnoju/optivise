import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'

const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#34D399' }
const PRIORITY_BG = { high: 'rgba(239,68,68,0.1)', medium: 'rgba(245,158,11,0.1)', low: 'rgba(52,211,153,0.1)' }
const TYPE_ICONS = {
  description: '✨', image: '🖼️', inventory: '📦', abtesting: '🧪',
  revenue: '💰', info: '🔗', pricing: '💲', seo: '🔍'
}

export default function RecommendationsPage() {
  const { formatCurrency } = useSettings()
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [applied, setApplied] = useState(new Set())
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('dismissed_recs') || '[]')) }
    catch { return new Set() }
  })

  const dismissRec = (id) => {
    setDismissed(prev => {
      const next = new Set([...prev, id])
      localStorage.setItem('dismissed_recs', JSON.stringify([...next]))
      return next
    })
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/suggestions', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      })
      if (res.ok) setSuggestions(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (suggestion) => {
    switch (suggestion.action) {
      case 'generate_description': navigate('/products'); break
      case 'create_ab_test': navigate('/abtesting'); break
      case 'connect_store': navigate('/profile'); break
      case 'create_bundle':
      case 'learn_more': navigate('/assistant'); break
      case 'view_analytics': navigate('/analytics'); break
      case 'add_images':
      case 'restock':
        if (suggestion.productId) {
          window.open(`https://admin.shopify.com/products/${suggestion.productId}`, '_blank')
        } else {
          navigate('/products')
        }
        break
      default: navigate('/dashboard'); break
    }
    setApplied(prev => new Set([...prev, suggestion.id]))
  }

  const filtered = suggestions.filter(s => !dismissed.has(String(s.id))).filter(s => {
    if (filter === 'all') return !applied.has(s.id)
    if (filter === 'applied') return applied.has(s.id)
    return s.priority === filter && !applied.has(s.id)
  })

  const counts = {
    all: suggestions.filter(s => !applied.has(s.id)).length,
    high: suggestions.filter(s => s.priority === 'high' && !applied.has(s.id)).length,
    medium: suggestions.filter(s => s.priority === 'medium' && !applied.has(s.id)).length,
    low: suggestions.filter(s => s.priority === 'low' && !applied.has(s.id)).length,
    applied: applied.size,
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>AI Recommendations</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {loading ? 'Analyzing your store...' : `${counts.all} actionable suggestions to grow your store`}
          </p>
        </div>
        <button onClick={fetchSuggestions} className="btn-ghost" style={{ fontSize: 13 }}>
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      {!loading && suggestions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'High Priority', count: counts.high, color: '#EF4444', icon: '🔴' },
            { label: 'Medium Priority', count: counts.medium, color: '#F59E0B', icon: '🟡' },
            { label: 'Applied', count: counts.applied, color: '#34D399', icon: '✅' },
          ].map((stat, i) => (
            <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'high', label: '🔴 High' },
          { key: 'medium', label: '🟡 Medium' },
          { key: 'low', label: '🟢 Low' },
          { key: 'applied', label: '✅ Applied' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all .15s',
            background: filter === f.key ? 'var(--purple)' : 'var(--bg-card)',
            color: filter === f.key ? 'white' : 'var(--text-muted)',
            border: filter === f.key ? '1px solid var(--purple)' : '1px solid var(--border)',
          }}>
            {f.label} <span style={{ opacity: 0.7 }}>({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Analyzing your store...</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Scanning products, orders, and opportunities</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{filter === 'applied' ? '🎉' : '✅'}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {filter === 'applied' ? 'No applied suggestions yet' : 'All caught up!'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {filter === 'applied' ? 'Apply suggestions to see them here' : 'No pending suggestions in this category.'}
          </div>
        </div>
      )}

      {/* Suggestion cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(s => (
          <div key={s.id} className="card" style={{
            padding: '20px', display: 'flex', gap: 16, alignItems: 'flex-start',
            borderLeft: `3px solid ${PRIORITY_COLORS[s.priority] || '#6366F1'}`,
            opacity: applied.has(s.id) ? 0.6 : 1
          }}>
            {/* Icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: PRIORITY_BG[s.priority] || 'rgba(99,102,241,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>
              {TYPE_ICONS[s.type] || '💡'}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{s.title}</div>
                <span style={{
                  padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  background: PRIORITY_BG[s.priority], color: PRIORITY_COLORS[s.priority],
                  flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.04em'
                }}>
                  {s.priority}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{s.description}</div>

              {/* Meta + Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ color: '#34D399', fontWeight: 600 }}>📈 {s.impact}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    ⏱️ {s.effort}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  {s.timestamp && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1 }}>
                      🕐 {s.timestamp}
                    </span>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); dismissRec(String(s.id)) }}
                    title="Dismiss"
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >✕ Dismiss</button>
                </div>
                <button onClick={() => handleAction(s)} style={{
                  background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                  color: 'white', border: 'none', borderRadius: 8,
                  padding: '8px 16px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit'
                }}>
                  {s.actionLabel || 'Take Action'} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}