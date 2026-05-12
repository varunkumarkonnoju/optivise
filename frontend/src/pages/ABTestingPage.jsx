import { useEffect, useState, useRef } from 'react'
import { productApi } from '../utils/api'
import {
  Plus, Pause, Play, Trash2, TestTube2, TrendingUp,
  CheckCircle, Sparkles, Trophy, RefreshCw, ChevronDown,
  ChevronUp, Users, Zap, X, AlertCircle
} from 'lucide-react'
import './ABTesting.css'

// Always get fresh token
const getToken = () => localStorage.getItem('token')

// ── API CALLS ─────────────────────────────────────────
const api = {
  getAll:      () => fetch('/api/abtests', { headers: { Authorization: 'Bearer ' + getToken() } }).then(r => r.json()),
  create:      (data) => fetch('/api/abtests', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() }, body: JSON.stringify(data) }).then(r => r.json()),
  pause:       (id) => fetch(`/api/abtests/${id}/pause`, { method: 'PUT', headers: { Authorization: 'Bearer ' + getToken() } }).then(r => r.json()),
  resume:      (id) => fetch(`/api/abtests/${id}/resume`, { method: 'PUT', headers: { Authorization: 'Bearer ' + getToken() } }).then(r => r.json()),
  delete:      (id) => fetch(`/api/abtests/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + getToken() } }),
  simulate:    (id) => fetch(`/api/abtests/${id}/simulate`, { method: 'POST', headers: { Authorization: 'Bearer ' + getToken() } }).then(r => r.json()),
  applyWinner: (id) => fetch(`/api/abtests/${id}/apply-winner`, { method: 'POST', headers: { Authorization: 'Bearer ' + getToken() } }).then(r => r.json()),
  insight:     (id) => fetch(`/api/abtests/${id}/insight`, { method: 'POST', headers: { Authorization: 'Bearer ' + getToken() } }).then(r => r.json()),
  generateDesc: (productId, productTitle) => fetch('/api/products/generate-description', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
    body: JSON.stringify({ productId, productTitle, price: 0, tone: 'professional', keywords: '' })
  }).then(r => r.json()),
}

// ── SIGNIFICANCE GAUGE ────────────────────────────────
function SignificanceGauge({ value = 0 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let frame = 0
    const steps = 40
    const timer = setInterval(() => {
      frame++
      setDisplay(Math.min(value, (value / steps) * frame))
      if (frame >= steps) clearInterval(timer)
    }, 25)
    return () => clearInterval(timer)
  }, [value])

  const color = value >= 95 ? '#10B981' : value >= 80 ? '#F59E0B' : value >= 50 ? '#6366F1' : '#64748b'
  const label = value >= 95 ? 'Significant!' : value >= 80 ? 'Almost There' : value >= 50 ? 'Building...' : 'Collecting'

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 6px' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
          <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 32}
            strokeDashoffset={2 * Math.PI * 32 * (1 - Math.min(display, 100) / 100)}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', filter: `drop-shadow(0 0 4px ${color}80)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1 }}>{Math.round(display)}</div>
          <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>%</div>
        </div>
      </div>
      <div style={{ fontSize: 9, color, fontWeight: 600 }}>{label}</div>
    </div>
  )
}

// ── VARIANT BOX ───────────────────────────────────────
function VariantBox({ label, conversion = 0, traffic = 0, orders = 0, isWinner, isLeading, color }) {
  return (
    <div style={{
      flex: 1,
      background: isWinner ? `${color}10` : 'var(--bg-secondary)',
      border: `1px solid ${isWinner ? color : isLeading ? `${color}40` : 'var(--border)'}`,
      borderRadius: 10, padding: '14px', position: 'relative',
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
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: isLeading ? color : 'var(--text-primary)', lineHeight: 1 }}>
        {(conversion || 0).toFixed(2)}%
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>conversion rate</div>
      <div style={{ display: 'flex', gap: 16 }}>
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
  const [test, setTest]                   = useState(initialTest)
  const [expanded, setExpanded]           = useState(false)
  const [applyingWinner, setApplyingWinner] = useState(false)
  const [applyMsg, setApplyMsg]           = useState('')
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [insightMsg, setInsightMsg]       = useState('')
  const [simulating, setSimulating]       = useState(false)
  const didSimulate = useRef(false)

  useEffect(() => { setTest(initialTest) }, [initialTest])

  // Auto-simulate once on mount for running tests
  useEffect(() => {
    if (test.status === 'running' && !didSimulate.current) {
      didSimulate.current = true
      doSimulate()
    }
  }, [])

  const doSimulate = async () => {
    setSimulating(true)
    try {
      const data = await api.simulate(test.id)
      if (data && data.id) { setTest(data); onUpdate?.(data) }
    } catch (e) { console.error('Simulate error', e) }
    finally { setSimulating(false) }
  }

  const togglePause = async () => {
    try {
      const data = test.status === 'running' ? await api.pause(test.id) : await api.resume(test.id)
      if (data?.id) { setTest(data); onUpdate?.(data) }
    } catch (e) { console.error(e) }
  }

  const applyWinner = async () => {
    setApplyingWinner(true); setApplyMsg('')
    try {
      const data = await api.applyWinner(test.id)
      if (data.success) {
        setApplyMsg(data.message || '✓ Winner applied to Shopify!')
        await doSimulate()
      } else {
        setApplyMsg('❌ ' + (data.error || 'Failed to apply'))
      }
    } catch (e) { setApplyMsg('❌ Error applying winner') }
    finally { setApplyingWinner(false) }
  }

  const generateInsight = async () => {
    setLoadingInsight(true)
    setInsightMsg('')
    try {
      const data = await api.insight(test.id)
      if (data.insight) {
        setTest(prev => ({ ...prev, insight: data.insight }))
        setInsightMsg('')
      } else if (data.error) {
        setInsightMsg('❌ ' + data.error)
      }
    } catch (e) {
      setInsightMsg('❌ Failed to generate insight')
      console.error('Insight error', e)
    } finally {
      setLoadingInsight(false)
    }
  }

  const convA   = test.variantAConversion || 0
  const convB   = test.variantBConversion || 0
  const bLeads  = convB >= convA
  const uplift  = convA > 0 ? ((convB - convA) / convA * 100) : 0
  const sig     = test.significanceLevel || 0
  const isComplete = test.status === 'completed'
  const daysRunning = test.startedAt
    ? Math.max(0, Math.floor((Date.now() - new Date(test.startedAt).getTime()) / 86400000))
    : 0

  const statusColors = { running: '#10B981', paused: '#F59E0B', completed: '#6366F1' }
  const sc = statusColors[test.status] || '#64748b'

  return (
    <div className="card" style={{ padding: '20px', marginBottom: 12 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <TestTube2 size={14} color="var(--purple-light)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{test.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${sc}15`, color: sc, border: `1px solid ${sc}30`, whiteSpace: 'nowrap' }}>
              {test.status === 'running' ? '● ' : ''}{test.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            {test.productTitle && <span>📦 {test.productTitle}</span>}
            <span>📅 Day {daysRunning} of {test.targetDays || 14}</span>
            <span style={{ textTransform: 'capitalize' }}>🏷️ {test.elementType}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {test.status === 'running' && (
            <button onClick={doSimulate} disabled={simulating} className="icon-btn" title="Refresh data" style={{ opacity: simulating ? 0.5 : 1 }}>
              <RefreshCw size={13} style={{ animation: simulating ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          )}
          {test.status !== 'completed' && (
            <button onClick={togglePause} className="icon-btn" title={test.status === 'running' ? 'Pause' : 'Resume'}>
              {test.status === 'running' ? <Pause size={13}/> : <Play size={13}/>}
            </button>
          )}
          <button onClick={onDelete} className="icon-btn danger"><Trash2 size={13}/></button>
          <button onClick={() => setExpanded(e => !e)} className="icon-btn">
            {expanded ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          </button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <VariantBox label={test.variantALabel || 'Variant A'} conversion={convA}
          traffic={test.variantATraffic} orders={test.variantAOrders}
          isWinner={isComplete && !bLeads} isLeading={!bLeads && convA > 0} color="#6366F1" />

        <div style={{ textAlign: 'center', padding: '0 6px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>VS</div>
          {convA > 0 && convB > 0 && (
            <div style={{ fontSize: 13, fontWeight: 800, color: uplift > 0 ? '#10B981' : '#EF4444' }}>
              {uplift > 0 ? '+' : ''}{uplift.toFixed(1)}%
            </div>
          )}
        </div>

        <VariantBox label={test.variantBLabel || 'Variant B'} conversion={convB}
          traffic={test.variantBTraffic} orders={test.variantBOrders}
          isWinner={isComplete && bLeads} isLeading={bLeads && convB > 0} color="#06B6D4" />

        <SignificanceGauge value={sig} />
      </div>

      {/* ── Traffic bar ── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>{test.variantALabel}</span>
          <span>50 / 50 traffic split</span>
          <span>{test.variantBLabel}</span>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: '50%', background: '#6366F1', borderRadius: '3px 0 0 3px' }} />
          <div style={{ width: '50%', background: '#06B6D4', borderRadius: '0 3px 3px 0' }} />
        </div>
      </div>

      {/* ── Insight box ── */}
      {test.insight && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, display: 'flex', gap: 8 }}>
          <Sparkles size={13} color="var(--purple-light)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{test.insight}</span>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Apply winner — show when sig >= 80 */}
        {(isComplete || sig >= 80) && (
          <button onClick={applyWinner} disabled={applyingWinner} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#10B981', border: 'none', borderRadius: 8,
            padding: '7px 14px', fontSize: 12, fontWeight: 700,
            color: 'white', cursor: applyingWinner ? 'not-allowed' : 'pointer',
            opacity: applyingWinner ? 0.7 : 1,
          }}>
            <Trophy size={12} />
            {applyingWinner ? 'Applying...' : `Apply ${bLeads ? (test.variantBLabel || 'Variant B') : (test.variantALabel || 'Variant A')} to Shopify`}
          </button>
        )}

        {/* AI Insight button */}
        <button onClick={generateInsight} disabled={loadingInsight} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600,
          color: 'var(--purple-light)', cursor: loadingInsight ? 'not-allowed' : 'pointer',
          opacity: loadingInsight ? 0.7 : 1,
        }}>
          <Sparkles size={12} />
          {loadingInsight ? 'Generating AI Insight...' : 'Get AI Insight'}
        </button>

        {applyMsg && (
          <span style={{ fontSize: 12, fontWeight: 600, color: applyMsg.startsWith('❌') ? '#EF4444' : '#10B981' }}>
            {applyMsg}
          </span>
        )}
        {insightMsg && (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#EF4444' }}>{insightMsg}</span>
        )}
      </div>

      {/* ── Expanded: descriptions ── */}
      {expanded && (
        <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          {(test.variantADescription || test.variantBDescription) ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: test.variantALabel, desc: test.variantADescription, color: '#6366F1' },
                { label: test.variantBLabel, desc: test.variantBDescription, color: '#06B6D4' },
              ].map((v, i) => (
                <div key={i} style={{ background: 'var(--bg-secondary)', border: `1px solid ${v.color}20`, borderRadius: 8, padding: '12px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: v.color, marginBottom: 8, textTransform: 'uppercase' }}>{v.label}</div>
                  {v.desc
                    ? <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: v.desc }} />
                    : <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>No description stored</div>
                  }
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              No descriptions stored for this test.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── CREATE MODAL ──────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [step, setStep]             = useState(1)
  const [products, setProducts]     = useState([])
  const [loadingProducts, setLP]    = useState(true)
  const [generatingB, setGeneratingB] = useState(false)
  const [genError, setGenError]     = useState('')
  const [creating, setCreating]     = useState(false)

  const [form, setForm] = useState({
    name: '',
    elementType: 'description',
    variantALabel: 'Original',
    variantBLabel: 'AI Version',
    variantADescription: '',
    variantBDescription: '',
    productId: '',
    productTitle: '',
    targetDays: '14',
  })

  // Load products
  useEffect(() => {
    productApi.getAll()
      .then(r => setProducts(r.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLP(false))
  }, [])

  // ── FIX 1: Selecting product always updates name AND description ──
  const selectProduct = (p) => {
    const autoName = `${p.title} — Description Test`
    setForm(f => ({
      ...f,
      productId:           String(p.id),
      productTitle:        p.title,
      name:                autoName,          // always update name
      variantADescription: p.description || '', // auto-fill from Shopify
      variantBDescription: '',               // reset B so user generates fresh
    }))
  }

  // ── FIX 2: Generate AI description properly ──
  const generateAIDescription = async () => {
    if (!form.productId || !form.productTitle) {
      setGenError('Please select a product first.')
      return
    }
    setGeneratingB(true)
    setGenError('')
    try {
      const data = await api.generateDesc(form.productId, form.productTitle)

      // Handle both response formats:
      // Old: { description: string }
      // New: { description: string, usage: {...} }
      // Also handle 429 (limit reached)
      if (data.error === 'limit_reached') {
        setGenError('Monthly limit reached. Upgrade your plan to generate more.')
        return
      }
      if (data.description) {
        setForm(f => ({ ...f, variantBDescription: data.description }))
      } else {
        setGenError('Failed to generate. Try again.')
      }
    } catch (e) {
      setGenError('Generation failed. Please try again.')
      console.error('Generate error', e)
    } finally {
      setGeneratingB(false)
    }
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return
    setCreating(true)
    try {
      await onCreate(form)
      onClose()
    } catch (e) {
      console.error('Create error', e)
    } finally {
      setCreating(false)
    }
  }

  const canProceed = form.name.trim().length > 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" style={{ maxWidth: 640, width: '92%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Create A/B Test</h3>
          <button onClick={onClose} className="icon-btn"><X size={14}/></button>
        </div>

        {/* Step tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-secondary)', borderRadius: 8, padding: 4 }}>
          {[{ n: 1, label: '1. Setup' }, { n: 2, label: '2. Descriptions' }].map(s => (
            <button key={s.n} onClick={() => { if (s.n === 2 && !canProceed) return; setStep(s.n) }} style={{
              flex: 1, padding: '7px', borderRadius: 6, border: 'none',
              cursor: s.n === 2 && !canProceed ? 'not-allowed' : 'pointer',
              background: step === s.n ? 'var(--purple)' : 'none',
              color: step === s.n ? 'white' : s.n === 2 && !canProceed ? 'var(--text-muted)' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: step === s.n ? 700 : 400,
              opacity: s.n === 2 && !canProceed ? 0.5 : 1,
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* ── STEP 1: SETUP ── */}
        {step === 1 && (
          <div>
            {/* Product selector */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Select Product to Test</label>
              {loadingProducts ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ height: 48, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  No products found. Connect your Shopify store first.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                  {products.map(p => {
                    const isSelected = form.productId === String(p.id)
                    return (
                      <div key={p.id} onClick={() => selectProduct(p)} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: isSelected ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                        border: `1px solid ${isSelected ? 'var(--purple)' : 'var(--border)'}`,
                        borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}>
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: 28, height: 28, borderRadius: 4, background: 'var(--bg-card)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📦</div>
                        }
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: isSelected ? 'var(--purple-light)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.title}
                          </div>
                          {p.price && <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>${p.price}</div>}
                        </div>
                        {isSelected && <CheckCircle size={13} color="var(--purple-light)" style={{ flexShrink: 0 }} />}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Test name */}
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Test Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Leather Jacket — Description Test"
              />
            </div>

            {/* Variant labels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label className="form-label">Variant A Label</label>
                <input className="form-input" value={form.variantALabel} onChange={e => setForm(f => ({ ...f, variantALabel: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Variant B Label</label>
                <input className="form-input" value={form.variantBLabel} onChange={e => setForm(f => ({ ...f, variantBLabel: e.target.value }))} />
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Test Duration</label>
              <select className="form-select" value={form.targetDays} onChange={e => setForm(f => ({ ...f, targetDays: e.target.value }))}>
                <option value="7">7 days</option>
                <option value="14">14 days (recommended)</option>
                <option value="21">21 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              disabled={!canProceed}
              style={{ width: '100%', justifyContent: 'center', opacity: canProceed ? 1 : 0.5 }}
            >
              Next: Add Descriptions →
            </button>
          </div>
        )}

        {/* ── STEP 2: DESCRIPTIONS ── */}
        {step === 2 && (
          <div>
            {/* Variant A — auto-filled from Shopify */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Variant A — {form.variantALabel}
                <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>
                  {form.variantADescription ? '✓ Loaded from Shopify' : '⚠ No description found'}
                </span>
              </label>
              <textarea
                className="form-input"
                value={form.variantADescription}
                onChange={e => setForm(f => ({ ...f, variantADescription: e.target.value }))}
                placeholder={form.productTitle
                  ? `No current description found for "${form.productTitle}" — paste one here or leave blank`
                  : 'Paste your current product description here...'}
                rows={5}
                style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 12 }}
              />
              {!form.variantADescription && form.productTitle && (
                <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertCircle size={11} />
                  This product has no description yet — that's actually a great reason to test one!
                </div>
              )}
            </div>

            {/* Variant B — AI generated */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Variant B — {form.variantBLabel}
                  {form.variantBDescription && (
                    <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, marginLeft: 8 }}>✓ Ready</span>
                  )}
                </label>
                <button
                  onClick={generateAIDescription}
                  disabled={generatingB}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: generatingB ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600,
                    color: 'var(--purple-light)', cursor: generatingB ? 'not-allowed' : 'pointer',
                    opacity: generatingB ? 0.6 : 1,
                  }}
                >
                  <Sparkles size={11} />
                  {generatingB ? 'Generating...' : form.variantBDescription ? 'Regenerate' : 'Generate with AI'}
                </button>
              </div>

              {genError && (
                <div style={{ fontSize: 11, color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '6px 10px', marginBottom: 6 }}>
                  {genError}
                </div>
              )}

              {generatingB ? (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    AI is writing a high-converting description...
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--purple)', borderRadius: 2, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </div>
                </div>
              ) : (
                <textarea
                  className="form-input"
                  value={form.variantBDescription}
                  onChange={e => setForm(f => ({ ...f, variantBDescription: e.target.value }))}
                  placeholder="Click 'Generate with AI' above or paste your own variant B description..."
                  rows={5}
                  style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 12 }}
                />
              )}
            </div>

            {/* Summary */}
            {form.productTitle && (
              <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                Testing <strong style={{ color: 'var(--text-primary)' }}>{form.productTitle}</strong> for <strong style={{ color: 'var(--text-primary)' }}>{form.targetDays} days</strong>
                {' — '}will auto-complete when results reach 95% statistical confidence.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
              <button
                className="btn-primary"
                onClick={handleCreate}
                disabled={!form.name || creating}
                style={{ flex: 2, justifyContent: 'center', opacity: !form.name || creating ? 0.6 : 1 }}
              >
                <Zap size={13} />
                {creating ? 'Starting test...' : 'Start A/B Test'}
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
  const [tests, setTests]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError]         = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getAll()
      setTests(Array.isArray(data) ? data : [])
    } catch (e) {
      setError('Failed to load tests')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async (form) => {
    await api.create(form)
    await load()
  }

  const del = async (id) => {
    await api.delete(id)
    setTests(prev => prev.filter(t => t.id !== id))
  }

  const updateTest = (updated) => {
    setTests(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  if (loading) return <div className="spinner" />

  const running   = tests.filter(t => t.status === 'running')
  const paused    = tests.filter(t => t.status === 'paused')
  const completed = tests.filter(t => t.status === 'completed')

  const totalVisitors = tests.reduce((s, t) => s + (t.variantATraffic || 0) + (t.variantBTraffic || 0), 0)
  const completedWithData = completed.filter(t => t.variantAConversion > 0)
  const avgUplift = completedWithData.length > 0
    ? completedWithData.reduce((s, t) => s + (t.variantAConversion > 0 ? (t.variantBConversion - t.variantAConversion) / t.variantAConversion * 100 : 0), 0) / completedWithData.length
    : 0

  return (
    <div className="abt-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">A/B Testing</h1>
          <p className="page-sub">Test product descriptions head-to-head — let real data pick the winner</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New Test
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#EF4444' }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="abt-stats">
        {[
          { label: 'Running Tests', value: running.length, color: 'var(--green)' },
          { label: 'Completed', value: completed.length, color: 'var(--purple-light)' },
          { label: 'Total Visitors', value: totalVisitors.toLocaleString(), color: 'var(--teal)' },
          { label: 'Avg Uplift', value: `${avgUplift > 0 ? '+' : ''}${avgUplift.toFixed(1)}%`, color: 'var(--amber)' },
        ].map((s, i) => (
          <div key={i} className="card abt-stat">
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {tests.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <TestTube2 size={44} color="var(--purple-light)" style={{ marginBottom: 16, opacity: 0.6 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No A/B tests yet</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
            Select a product, paste the original description, generate an AI version — then let data decide which converts better.
          </p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Create First Test
          </button>
        </div>
      )}

      {/* Running */}
      {running.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            Running ({running.length})
          </h2>
          {running.map(t => <TestCard key={t.id} test={t} onDelete={() => del(t.id)} onUpdate={updateTest} />)}
        </section>
      )}

      {/* Paused */}
      {paused.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 className="section-title">Paused ({paused.length})</h2>
          {paused.map(t => <TestCard key={t.id} test={t} onDelete={() => del(t.id)} onUpdate={updateTest} />)}
        </section>
      )}

      {/* Completed */}
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