import { useEffect, useState, useRef } from 'react'
import { abTestApi, productApi } from '../utils/api'
import {
  Plus, Pause, Play, Trash2, TestTube2, TrendingUp,
  CheckCircle, Sparkles, Trophy, RefreshCw, ChevronDown,
  ChevronUp, Users, ShoppingCart, BarChart3, Zap, X
} from 'lucide-react'
import './ABTesting.css'

const token = localStorage.getItem('token')

// ── SIGNIFICANCE GAUGE ────────────────────────────────
function SignificanceGauge({ value = 0 }) {
  const color = value >= 95 ? '#10B981' : value >= 80 ? '#F59E0B' : value >= 50 ? '#6366F1' : '#64748b'
  const label = value >= 95 ? 'Statistically Significant!' : value >= 80 ? 'Almost Significant' : value >= 50 ? 'Building Confidence' : 'Collecting Data'

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 6px' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
          <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 32}
            strokeDashoffset={2 * Math.PI * 32 * (1 - Math.min(value, 100) / 100)}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 4px ${color}80)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1 }}>{value.toFixed(0)}</div>
          <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>%</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color, fontWeight: 600 }}>{label}</div>
    </div>
  )
}

// ── VARIANT BOX ───────────────────────────────────────
function VariantBox({ label, conversion = 0, traffic = 0, orders = 0, isWinner, isLeading, color }) {
  return (
    <div style={{
      flex: 1, background: isWinner ? `${color}10` : 'var(--bg-secondary)',
      border: `1px solid ${isWinner ? color : isLeading ? `${color}40` : 'var(--border)'}`,
      borderRadius: 10, padding: '14px',
      position: 'relative',
    }}>
      {isWinner && (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          background: color, borderRadius: 20, padding: '2px 10px',
          fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap',
        }}>
          🏆 WINNER
        </div>
      )}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: isLeading ? color : 'var(--text-primary)', lineHeight: 1 }}>
        {(conversion || 0).toFixed(2)}%
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>conversion rate</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{(traffic || 0).toLocaleString()}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>visitors</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{(orders || 0).toLocaleString()}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>orders</div>
        </div>
      </div>
    </div>
  )
}

// ── TEST CARD ─────────────────────────────────────────
function TestCard({ test: initialTest, onDelete, onUpdate }) {
  const [test, setTest] = useState(initialTest)
  const [expanded, setExpanded] = useState(false)
  const [applyingWinner, setApplyingWinner] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const [generatingInsight, setGeneratingInsight] = useState(false)
  const simulatedRef = useRef(false)

  useEffect(() => {
    setTest(initialTest)
  }, [initialTest])

  // Auto-simulate on mount for running tests
  useEffect(() => {
    if (test.status === 'running' && !simulatedRef.current) {
      simulatedRef.current = true
      simulateProgress()
    }
  }, [])

  const simulateProgress = async () => {
    try {
      const res = await fetch(`/api/abtests/${test.id}/simulate`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
      })
      const data = await res.json()
      setTest(data)
      onUpdate?.(data)
    } catch (e) {
      console.error('Simulate error', e)
    }
  }

  const togglePause = async () => {
    try {
      const endpoint = test.status === 'running' ? 'pause' : 'resume'
      const res = await fetch(`/api/abtests/${test.id}/${endpoint}`, {
        method: 'PUT', headers: { Authorization: 'Bearer ' + token }
      })
      const data = await res.json()
      setTest(data)
      onUpdate?.(data)
    } catch (e) { console.error(e) }
  }

  const applyWinner = async () => {
    setApplyingWinner(true); setApplyMsg('')
    try {
      const res = await fetch(`/api/abtests/${test.id}/apply-winner`, {
        method: 'POST', headers: { Authorization: 'Bearer ' + token }
      })
      const data = await res.json()
      if (data.success) {
        setApplyMsg(data.message)
        simulateProgress()
      } else {
        setApplyMsg('Failed: ' + (data.error || 'Unknown error'))
      }
    } catch (e) { setApplyMsg('Failed to apply winner') }
    finally { setApplyingWinner(false) }
  }

  const generateAIInsight = async () => {
    setGeneratingInsight(true)
    try {
      const res = await fetch(`/api/abtests/${test.id}/insight`, {
        method: 'POST', headers: { Authorization: 'Bearer ' + token }
      })
      const data = await res.json()
      if (data.insight) setTest(prev => ({ ...prev, insight: data.insight }))
    } catch (e) { console.error(e) }
    finally { setGeneratingInsight(false) }
  }

  const convA = test.variantAConversion || 0
  const convB = test.variantBConversion || 0
  const bLeads = convB > convA
  const uplift = convA > 0 ? ((convB - convA) / convA * 100) : 0
  const sig = test.significanceLevel || 0
  const isComplete = test.status === 'completed'

  const statusColors = { running: '#10B981', paused: '#F59E0B', completed: '#6366F1' }
  const statusColor = statusColors[test.status] || '#64748b'

  const daysRunning = test.startedAt
    ? Math.floor((Date.now() - new Date(test.startedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="card" style={{ padding: '20px', marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <TestTube2 size={14} color="var(--purple-light)" />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{test.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: `${statusColor}15`, color: statusColor,
              border: `1px solid ${statusColor}30`,
            }}>
              {test.status === 'running' ? '● ' : ''}{test.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            {test.productTitle && <span>📦 {test.productTitle}</span>}
            <span>📅 Day {daysRunning} of {test.targetDays}</span>
            <span style={{ textTransform: 'capitalize' }}>🏷️ {test.elementType}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {test.status === 'running' && (
            <button onClick={simulateProgress} className="icon-btn" title="Refresh data">
              <RefreshCw size={13} />
            </button>
          )}
          {test.status !== 'completed' && (
            <button onClick={togglePause} className="icon-btn" title={test.status === 'running' ? 'Pause' : 'Resume'}>
              {test.status === 'running' ? <Pause size={13}/> : <Play size={13}/>}
            </button>
          )}
          <button onClick={onDelete} className="icon-btn danger"><Trash2 size={13}/></button>
          <button onClick={() => setExpanded(!expanded)} className="icon-btn">
            {expanded ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          </button>
        </div>
      </div>

      {/* Main metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <VariantBox
          label={test.variantALabel}
          conversion={convA} traffic={test.variantATraffic} orders={test.variantAOrders}
          isWinner={isComplete && !bLeads}
          isLeading={!bLeads && convA > 0}
          color="#6366F1"
        />

        <div style={{ textAlign: 'center', padding: '0 8px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8 }}>VS</div>
          {convA > 0 && convB > 0 && (
            <div style={{
              fontSize: 13, fontWeight: 800,
              color: uplift > 0 ? '#10B981' : '#EF4444',
            }}>
              {uplift > 0 ? '+' : ''}{uplift.toFixed(1)}%
            </div>
          )}
        </div>

        <VariantBox
          label={test.variantBLabel}
          conversion={convB} traffic={test.variantBTraffic} orders={test.variantBOrders}
          isWinner={isComplete && bLeads}
          isLeading={bLeads && convB > 0}
          color="#06B6D4"
        />

        <SignificanceGauge value={sig} />
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 10, color: 'var(--text-muted)' }}>
          <span>{test.variantALabel}</span>
          <span>Traffic Split</span>
          <span>{test.variantBLabel}</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: '50%', background: '#6366F1', borderRadius: '3px 0 0 3px' }} />
          <div style={{ width: '50%', background: '#06B6D4', borderRadius: '0 3px 3px 0' }} />
        </div>
      </div>

      {/* Insight */}
      {test.insight && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: '10px 14px',
          fontSize: 12, color: 'var(--text-secondary)',
          lineHeight: 1.6, marginBottom: 12,
          display: 'flex', gap: 8,
        }}>
          <Sparkles size={13} color="var(--purple-light)" style={{ flexShrink: 0, marginTop: 1 }} />
          {test.insight}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {/* Apply winner */}
        {test.productId && (isComplete || sig >= 80) && (
          <button
            onClick={applyWinner}
            disabled={applyingWinner}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#10B981', border: 'none', borderRadius: 8,
              padding: '7px 14px', fontSize: 12, fontWeight: 700,
              color: 'white', cursor: 'pointer',
            }}
          >
            <Trophy size={12} />
            {applyingWinner ? 'Applying...' : `Apply ${bLeads ? test.variantBLabel : test.variantALabel} to Shopify`}
          </button>
        )}
        {/* AI Insight */}
        <button
          onClick={generateAIInsight}
          disabled={generatingInsight}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--purple-dim)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600,
            color: 'var(--purple-light)', cursor: 'pointer',
          }}
        >
          <Sparkles size={12} />
          {generatingInsight ? 'Analyzing...' : 'AI Insight'}
        </button>
        {applyMsg && (
          <span style={{ fontSize: 12, color: applyMsg.includes('Failed') ? '#EF4444' : '#10B981', fontWeight: 600, alignSelf: 'center' }}>
            {applyMsg}
          </span>
        )}
      </div>

      {/* Expanded: show descriptions */}
      {expanded && (test.variantADescription || test.variantBDescription) && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: test.variantALabel, desc: test.variantADescription, color: '#6366F1' },
            { label: test.variantBLabel, desc: test.variantBDescription, color: '#06B6D4' },
          ].map((v, i) => v.desc && (
            <div key={i} style={{ background: 'var(--bg-secondary)', border: `1px solid ${v.color}20`, borderRadius: 8, padding: '12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: v.color, marginBottom: 8, textTransform: 'uppercase' }}>{v.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: v.desc }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── CREATE MODAL ──────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [step, setStep] = useState(1) // 1=setup, 2=descriptions
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [generatingB, setGeneratingB] = useState(false)
  const [form, setForm] = useState({
    name: '', elementType: 'description',
    variantALabel: 'Original', variantBLabel: 'AI Version',
    variantADescription: '', variantBDescription: '',
    productId: '', productTitle: '', targetDays: '14',
  })

  useEffect(() => {
    productApi.getAll()
      .then(r => setProducts(r.data || []))
      .catch(() => {})
      .finally(() => setLoadingProducts(false))
  }, [])

  const selectProduct = (p) => {
    setForm(f => ({
      ...f,
      productId: String(p.id),
      productTitle: p.title,
      name: f.name || `${p.title} — Description Test`,
      variantADescription: p.description || '',
    }))
  }

  const generateAIDescription = async () => {
    if (!form.productTitle) return
    setGeneratingB(true)
    try {
      const res = await fetch('/api/products/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          productId: form.productId,
          productTitle: form.productTitle,
          price: 0,
          tone: 'professional',
          keywords: '',
        })
      })
      const data = await res.json()
      if (data.description) setForm(f => ({ ...f, variantBDescription: data.description }))
    } catch (e) { console.error(e) }
    finally { setGeneratingB(false) }
  }

  const handleCreate = () => {
    if (!form.name) return
    onCreate(form)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" style={{ maxWidth: 620, width: '90%' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Create A/B Test</h3>
          <button onClick={onClose} className="icon-btn"><X size={14}/></button>
        </div>

        {/* Step tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-secondary)', borderRadius: 8, padding: 4 }}>
          {[{n:1,label:'Setup'},{n:2,label:'Descriptions'}].map(s => (
            <button key={s.n} onClick={() => setStep(s.n)} style={{
              flex: 1, padding: '7px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: step === s.n ? 'var(--purple)' : 'none',
              color: step === s.n ? 'white' : 'var(--text-muted)',
              fontSize: 12, fontWeight: step === s.n ? 700 : 400,
            }}>
              {s.n}. {s.label}
            </button>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            {/* Product selector */}
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Select Product to Test</label>
              {loadingProducts ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading products...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                  {products.map(p => (
                    <div key={p.id}
                      onClick={() => selectProduct(p)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: form.productId === String(p.id) ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                        border: `1px solid ${form.productId === String(p.id) ? 'var(--purple)' : 'var(--border)'}`,
                        borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                      }}
                    >
                      {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />}
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      {form.productId === String(p.id) && <CheckCircle size={12} color="var(--purple-light)" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Test Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Leather Jacket — Description Test" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label className="form-label">Variant A Label</label>
                <input className="form-input" value={form.variantALabel} onChange={e => setForm({...form, variantALabel: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Variant B Label</label>
                <input className="form-input" value={form.variantBLabel} onChange={e => setForm({...form, variantBLabel: e.target.value})} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Test Duration</label>
              <select className="form-select" value={form.targetDays} onChange={e => setForm({...form, targetDays: e.target.value})}>
                <option value="7">7 days</option>
                <option value="14">14 days (recommended)</option>
                <option value="21">21 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

            <button className="btn-primary" onClick={() => setStep(2)} disabled={!form.name} style={{ width: '100%', justifyContent: 'center' }}>
              Next: Add Descriptions →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Variant A — {form.variantALabel} (Original)</label>
              </div>
              <textarea
                className="form-input"
                value={form.variantADescription}
                onChange={e => setForm({...form, variantADescription: e.target.value})}
                placeholder="Paste your current product description here..."
                rows={5}
                style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 12 }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Variant B — {form.variantBLabel} (AI Version)</label>
                <button
                  onClick={generateAIDescription}
                  disabled={generatingB || !form.productTitle}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600,
                    color: 'var(--purple-light)', cursor: 'pointer',
                  }}
                >
                  <Sparkles size={11} />
                  {generatingB ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <textarea
                className="form-input"
                value={form.variantBDescription}
                onChange={e => setForm({...form, variantBDescription: e.target.value})}
                placeholder="Paste or generate an AI description to test against..."
                rows={5}
                style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 12 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
              <button className="btn-primary" onClick={handleCreate} disabled={!form.name} style={{ flex: 1, justifyContent: 'center' }}>
                <Zap size={13} /> Start Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────
export default function ABTestingPage() {
  const [tests, setTests]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = () => abTestApi.getAll().then(r => setTests(r.data || [])).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const create = async (form) => {
    await fetch('/api/abtests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(form),
    })
    load()
  }

  const del = async (id) => {
    await fetch(`/api/abtests/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } })
    load()
  }

  const updateTest = (updated) => {
    setTests(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  if (loading) return <div className="spinner" />

  const running   = tests.filter(t => t.status === 'running')
  const paused    = tests.filter(t => t.status === 'paused')
  const completed = tests.filter(t => t.status === 'completed')

  const totalVisitors = tests.reduce((s, t) => s + (t.variantATraffic || 0) + (t.variantBTraffic || 0), 0)
  const avgUplift = tests.length > 0
    ? tests.reduce((s, t) => {
        const u = t.variantAConversion > 0 ? ((t.variantBConversion - t.variantAConversion) / t.variantAConversion * 100) : 0
        return s + u
      }, 0) / tests.length
    : 0

  return (
    <div className="abt-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">A/B Testing</h1>
          <p className="page-sub">Test product descriptions head-to-head and let real data pick the winner</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New Test
        </button>
      </div>

      {/* Stats */}
      <div className="abt-stats">
        {[
          { label: 'Running Tests', value: running.length, color: 'var(--green)', icon: <TestTube2 size={16}/> },
          { label: 'Completed', value: completed.length, color: 'var(--purple-light)', icon: <CheckCircle size={16}/> },
          { label: 'Total Visitors', value: totalVisitors.toLocaleString(), color: 'var(--teal)', icon: <Users size={16}/> },
          { label: 'Avg Uplift', value: `${avgUplift > 0 ? '+' : ''}${avgUplift.toFixed(1)}%`, color: 'var(--amber)', icon: <TrendingUp size={16}/> },
        ].map((s, i) => (
          <div key={i} className="card abt-stat">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {tests.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <TestTube2 size={44} color="var(--purple-light)" style={{ marginBottom: 16, opacity: 0.6 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            No A/B tests yet
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
            Create your first test to compare your current description vs an AI version.
            Data decides the winner.
          </p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Create First Test
          </button>
        </div>
      )}

      {/* Running tests */}
      {running.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            Running Tests ({running.length})
          </h2>
          {running.map(t => <TestCard key={t.id} test={t} onDelete={() => del(t.id)} onUpdate={updateTest} />)}
        </section>
      )}

      {/* Paused tests */}
      {paused.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 className="section-title">Paused ({paused.length})</h2>
          {paused.map(t => <TestCard key={t.id} test={t} onDelete={() => del(t.id)} onUpdate={updateTest} />)}
        </section>
      )}

      {/* Completed tests */}
      {completed.length > 0 && (
        <section>
          <h2 className="section-title">Completed ({completed.length})</h2>
          {completed.map(t => <TestCard key={t.id} test={t} onDelete={() => del(t.id)} onUpdate={updateTest} />)}
        </section>
      )}

      {/* Create Modal */}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={create} />}
    </div>
  )
}