import { useEffect, useState } from 'react'
import { suggestionApi } from '../utils/api'
import { Sparkles, CheckCircle, Tag, TrendingUp, ShoppingBag, Megaphone, Check } from 'lucide-react'
import './Recommendations.css'

const catIcon = { product: ShoppingBag, pricing: Tag, conversion: TrendingUp, marketing: Megaphone }
const catColor = { product: 'var(--purple)', pricing: 'var(--amber)', conversion: 'var(--teal)', marketing: 'var(--green)' }

export default function RecommendationsPage() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => suggestionApi.getAll().then(r => setSuggestions(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const apply = async (id) => {
    await suggestionApi.apply(id)
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, applied: true } : s))
  }

  const filtered = filter === 'all' ? suggestions
    : filter === 'applied' ? suggestions.filter(s => s.applied)
    : suggestions.filter(s => !s.applied && s.impact?.toLowerCase() === filter)

  if (loading) return <div className="spinner" />

  const pending = suggestions.filter(s => !s.applied).length

  return (
    <div className="reco-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Recommendations</h1>
          <p className="page-sub">{pending} actionable suggestions to grow your store</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--purple-dim)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
          <Sparkles size={14} style={{ color: 'var(--purple-light)' }} />
          <span style={{ fontSize: 12, color: 'var(--purple-light)', fontWeight: 600 }}>Updated just now</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="reco-tabs">
        {['all', 'high', 'medium', 'low', 'applied'].map(f => (
          <button key={f} className={`reco-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="tab-count">{
              f === 'all' ? suggestions.length
              : f === 'applied' ? suggestions.filter(s => s.applied).length
              : suggestions.filter(s => !s.applied && s.impact?.toLowerCase() === f).length
            }</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="reco-grid">
        {filtered.map(s => {
          const Icon = catIcon[s.category] || Sparkles
          const color = catColor[s.category] || 'var(--purple)'
          return (
            <div key={s.id} className={`card reco-card ${s.applied ? 'applied' : ''}`}>
              <div className="reco-card-top">
                <div className="reco-icon" style={{ background: color + '22', color }}>
                  <Icon size={16} />
                </div>
                <span className={`badge badge-${s.impact?.toLowerCase()}`}>{s.impact} Impact</span>
              </div>
              <div className="reco-title">{s.title}</div>
              <div className="reco-desc">{s.description}</div>
              <div className="reco-footer">
                <span className="reco-cat" style={{ color }}>{s.category}</span>
                {s.applied ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>
                    <CheckCircle size={13} /> Applied
                  </div>
                ) : (
                  <button className="btn-apply" onClick={() => apply(s.id)}>
                    <Check size={12} /> Apply
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
          <CheckCircle size={40} style={{ margin: '0 auto 12px', color: 'var(--green)' }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>All caught up!</div>
          <div style={{ fontSize: 13 }}>No pending suggestions in this category.</div>
        </div>
      )}
    </div>
  )
}
