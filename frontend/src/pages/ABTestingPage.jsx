import { useEffect, useState } from 'react'
import { abTestApi } from '../utils/api'
import { Plus, Pause, Play, Trash2, TestTube2, TrendingUp } from 'lucide-react'
import './ABTesting.css'

export default function ABTestingPage() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', elementType: 'hero', variantALabel: 'Variant A', variantBLabel: 'Variant B' })

  const load = () => abTestApi.getAll().then(r => setTests(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const create = async () => {
    await abTestApi.create(form)
    setShowCreate(false)
    setForm({ name: '', elementType: 'hero', variantALabel: 'Variant A', variantBLabel: 'Variant B' })
    load()
  }

  const togglePause = async (t) => {
    if (t.status === 'running') await abTestApi.pause(t.id)
    else if (t.status === 'paused') await abTestApi.resume(t.id)
    load()
  }

  const del = async (id) => { await abTestApi.delete(id); load() }

  if (loading) return <div className="spinner" />

  const running = tests.filter(t => t.status === 'running')
  const others = tests.filter(t => t.status !== 'running')

  return (
    <div className="abt-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">A/B Testing</h1>
          <p className="page-sub">Run experiments to optimize your store's performance</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New Test
        </button>
      </div>

      {/* Stats bar */}
      <div className="abt-stats">
        {[
          { label: 'Running', value: running.length, color: 'var(--green)' },
          { label: 'Completed', value: tests.filter(t => t.status === 'completed').length, color: 'var(--purple-light)' },
          { label: 'Avg Uplift', value: '+41%', color: 'var(--teal)' },
        ].map((s, i) => (
          <div key={i} className="card abt-stat">
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Running Tests */}
      {running.length > 0 && (
        <section>
          <h2 className="section-title">Running Tests</h2>
          <div className="tests-grid">
            {running.map(t => <TestCard key={t.id} test={t} onToggle={() => togglePause(t)} onDelete={() => del(t.id)} />)}
          </div>
        </section>
      )}

      {/* Other Tests */}
      {others.length > 0 && (
        <section>
          <h2 className="section-title">All Tests</h2>
          <div className="tests-grid">
            {others.map(t => <TestCard key={t.id} test={t} onToggle={() => togglePause(t)} onDelete={() => del(t.id)} />)}
          </div>
        </section>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal card" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Create New A/B Test</h3>
            <Field label="Test Name" value={form.name} onChange={v => setForm({...form, name: v})} placeholder="e.g. Homepage Hero Image" />
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Element Type</label>
              <select value={form.elementType} onChange={e => setForm({...form, elementType: e.target.value})} className="form-select">
                {['hero','button','pricing','description','banner'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Variant A Label" value={form.variantALabel} onChange={v => setForm({...form, variantALabel: v})} />
              <Field label="Variant B Label" value={form.variantBLabel} onChange={v => setForm({...form, variantBLabel: v})} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => setShowCreate(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn-primary" onClick={create} disabled={!form.name} style={{ flex: 1, justifyContent: 'center' }}>Create Test</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TestCard({ test, onToggle, onDelete }) {
  const winner = test.variantBConversion > test.variantAConversion ? 'B' : 'A'
  const uplift = test.variantAConversion > 0
    ? (((test.variantBConversion - test.variantAConversion) / test.variantAConversion) * 100).toFixed(1)
    : '0'

  return (
    <div className="card test-card">
      <div className="test-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TestTube2 size={14} style={{ color: 'var(--purple-light)' }} />
            <span className="test-name">{test.name}</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{test.elementType}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge badge-${test.status}`}>{test.status === 'running' ? '● ' : ''}{test.status}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {test.status !== 'completed' && (
              <button className="icon-btn" onClick={onToggle} title={test.status === 'running' ? 'Pause' : 'Resume'}>
                {test.status === 'running' ? <Pause size={13}/> : <Play size={13}/>}
              </button>
            )}
            <button className="icon-btn danger" onClick={onDelete}><Trash2 size={13}/></button>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="variants-row">
        <VariantBox label={test.variantALabel} conversion={test.variantAConversion} traffic={test.variantATraffic} isWinner={test.status === 'completed' && winner === 'A'} />
        <div className="vs-divider">VS</div>
        <VariantBox label={test.variantBLabel} conversion={test.variantBConversion} traffic={test.variantBTraffic} isWinner={test.status === 'completed' && winner === 'B'} highlight />
      </div>

      {/* Traffic bar */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Traffic Distribution</div>
        <div className="traffic-bar">
          <div className="traffic-a" style={{ width: test.variantATraffic + '%' }}>{test.variantATraffic}%</div>
          <div className="traffic-b" style={{ width: test.variantBTraffic + '%' }}>{test.variantBTraffic}%</div>
        </div>
      </div>

      {/* Uplift */}
      {parseFloat(uplift) !== 0 && (
        <div className="uplift-row">
          <TrendingUp size={13} style={{ color: 'var(--green)' }} />
          <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
            Variant B is {uplift}% {parseFloat(uplift) > 0 ? 'better' : 'worse'}
          </span>
        </div>
      )}

      {/* Insight */}
      {test.insight && (
        <div className="test-insight">{test.insight}</div>
      )}
    </div>
  )
}

function VariantBox({ label, conversion, traffic, isWinner, highlight }) {
  return (
    <div className={`variant-box ${highlight ? 'variant-b' : 'variant-a'} ${isWinner ? 'is-winner' : ''}`}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: highlight ? 'var(--teal)' : 'var(--text-primary)' }}>{conversion?.toFixed(2)}%</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Conversion Rate</div>
      {isWinner && <div style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 700, marginTop: 6 }}>🏆 WINNER</div>}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="form-label">{label}</label>
      <input className="form-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}
