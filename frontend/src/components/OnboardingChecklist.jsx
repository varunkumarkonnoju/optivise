import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { productApi } from '../utils/api'
import {
  Sparkles, CheckCircle, ArrowRight, Store,
  TestTube2, TrendingDown, Zap, X
} from 'lucide-react'

const STEPS = [
  {
    id: 'connect',
    icon: Store,
    color: '#6366F1',
    title: 'Connect your Shopify store',
    subtitle: 'Takes 90 seconds. Read-only access — completely safe.',
  },
  {
    id: 'description',
    icon: Sparkles,
    color: '#10B981',
    title: 'Generate your first AI description',
    subtitle: 'Pick a product and watch AI write a better description in seconds.',
  },
  {
    id: 'leaks',
    icon: TrendingDown,
    color: '#EF4444',
    title: 'Find your revenue leaks',
    subtitle: 'See exactly where your store is losing money every month.',
  },
  {
    id: 'health',
    icon: TestTube2,
    color: '#F59E0B',
    title: 'Check your store health',
    subtitle: 'See your store health score and what to improve next.',
  },
]

const STORAGE_KEY = 'optivise_onboarding_v2'

function getProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : { completed: [], dismissed: false, step: 0 }
  } catch { return { completed: [], dismissed: false, step: 0 } }
}

function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

// ── Mini checklist shown on dashboard ────────────────────────
export function OnboardingChecklist({ shopConnected }) {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(getProgress)
  const [showFull, setShowFull] = useState(false)

  const completed = shopConnected
    ? [...new Set([...progress.completed, 'connect'])]
    : progress.completed

  const doneCount = STEPS.filter(s => completed.includes(s.id)).length
  const allDone = doneCount === STEPS.length

  useEffect(() => {
    if (shopConnected && !progress.completed.includes('connect')) {
      const next = { ...progress, completed: [...progress.completed, 'connect'] }
      setProgress(next)
      saveProgress(next)
    }
  }, [shopConnected])

  if (progress.dismissed || allDone) return null

  const markDone = (id) => {
    const next = { ...progress, completed: [...new Set([...progress.completed, id])] }
    setProgress(next)
    saveProgress(next)
  }

  const dismiss = () => {
    const next = { ...progress, dismissed: true }
    setProgress(next)
    saveProgress(next)
  }

  const pct = (doneCount / STEPS.length) * 100

  return (
    <>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 12, padding: '16px 20px',
        marginBottom: 20, position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              🚀 Get started with Optivise
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {doneCount} of {STEPS.length} steps complete
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowFull(true)}
              style={{ fontSize: 12, color: 'var(--purple-light)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View guide →
            </button>
            <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#6366F1', borderRadius: 2, transition: 'width 0.5s ease' }} />
        </div>

        {/* Steps inline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {STEPS.map((step, i) => {
            const done = completed.includes(step.id)
            const Icon = step.icon
            return (
              <button
                key={step.id}
                onClick={() => {
                  if (!done) {
                    if (step.id === 'connect') navigate('/settings')
                    else if (step.id === 'description') navigate('/products')
                    else if (step.id === 'leaks') navigate('/insights')
                    else if (step.id === 'health') navigate('/automations')
                    markDone(step.id)
                  }
                }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  background: done ? `${step.color}10` : 'var(--bg-card)',
                  border: `1px solid ${done ? step.color + '40' : 'var(--border)'}`,
                  borderRadius: 10, padding: '10px 8px', cursor: done ? 'default' : 'pointer',
                  transition: 'all 0.2s', textAlign: 'center',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: done ? step.color : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {done
                    ? <CheckCircle size={14} color="white" />
                    : <Icon size={13} color={step.color} />
                  }
                </div>
                <span style={{ fontSize: 10, color: done ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.3, fontWeight: done ? 600 : 400 }}>
                  {step.title.split(' ').slice(0, 3).join(' ')}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Full guide modal */}
      {showFull && (
        <OnboardingModal
          completed={completed}
          onClose={() => setShowFull(false)}
          onMarkDone={markDone}
          shopConnected={shopConnected}
        />
      )}
    </>
  )
}

// ── Full onboarding modal ─────────────────────────────────────
function OnboardingModal({ completed, onClose, onMarkDone, shopConnected }) {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(() => {
    const first = STEPS.findIndex(s => !completed.includes(s.id))
    return first === -1 ? 0 : first
  })

  const step = STEPS[activeStep]
  const done = completed.includes(step.id)
  const Icon = step.icon
  const doneCount = STEPS.filter(s => completed.includes(s.id)).length

  const goAndMark = (path) => {
    onMarkDone(step.id)
    navigate(path)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#0D1625', borderRadius: 16,
        border: '1px solid rgba(99,102,241,0.3)',
        width: 560, maxHeight: '85vh', overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Getting started guide</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{doneCount} of {STEPS.length} complete</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', height: 420 }}>
          {/* Step list */}
          <div style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 0', overflowY: 'auto' }}>
            {STEPS.map((s, i) => {
              const isDone = completed.includes(s.id)
              const isActive = i === activeStep
              const SIcon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', background: isActive ? 'rgba(99,102,241,0.1)' : 'none',
                    border: 'none', borderLeft: isActive ? `3px solid ${s.color}` : '3px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: isDone ? s.color : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isDone
                      ? <CheckCircle size={14} color="white" />
                      : <SIcon size={13} color={isActive ? s.color : '#64748b'} />
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.3 }}>
                      Step {i + 1}
                    </div>
                    <div style={{ fontSize: 11, color: isDone ? s.color : isActive ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.3 }}>
                      {isDone ? '✓ Done' : s.title.split(' ').slice(0, 3).join(' ') + '...'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Step content */}
          <div style={{ flex: 1, padding: '28px 28px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `${step.color}15`, border: `1px solid ${step.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, fontSize: 24,
            }}>
              <Icon size={24} color={step.color} />
            </div>

            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {step.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              {step.subtitle}
            </div>

            {/* Step-specific content */}
            {step.id === 'connect' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '🔒', text: 'Official Shopify OAuth — no password sharing' },
                  { icon: '👁️', text: 'Read-only access — we never modify without permission' },
                  { icon: '⚡', text: 'Takes exactly 90 seconds to connect' },
                  { icon: '📊', text: 'Pulls real products, orders, and revenue data' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
                {shopConnected && (
                  <div style={{ marginTop: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#10B981' }}>
                    ✅ Your store is already connected!
                  </div>
                )}
              </div>
            )}

            {step.id === 'description' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#64748b' }}>
                  ❌ Before: "Blue t-shirt. Good quality. Fast shipping."
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1', fontSize: 18 }}>↓ AI rewrites in 3 seconds</div>
                <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                  ✅ After: "The everyday essential you've been looking for. Crafted from premium cotton that breathes all day..."
                </div>
              </div>
            )}

            {step.id === 'leaks' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { color: '#EF4444', label: 'Products with weak descriptions', tag: 'High impact' },
                  { color: '#F59E0B', label: 'Products missing images', tag: 'Medium' },
                  { color: '#6366F1', label: 'One-time customers to win back', tag: 'Opportunity' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', borderLeft: `3px solid ${item.color}`, borderRadius: '0 8px 8px 0', padding: '8px 12px', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 700 }}>{item.tag}</span>
                  </div>
                ))}
              </div>
            )}

            {step.id === 'health' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Your Store Health score checks your descriptions, images, and optimization status across every product — and shows you exactly what to improve, with one-click fixes.
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  All based on your real Shopify data — no estimates.
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              {done ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#10B981', fontWeight: 600 }}>
                  <CheckCircle size={16} /> Step completed!
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (step.id === 'connect') goAndMark('/settings')
                    else if (step.id === 'description') goAndMark('/products')
                    else if (step.id === 'leaks') goAndMark('/insights')
                    else if (step.id === 'health') goAndMark('/automations')
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: step.color, border: 'none', borderRadius: 10,
                    padding: '10px 20px', fontSize: 13, fontWeight: 700,
                    color: 'white', cursor: 'pointer',
                  }}
                >
                  <Zap size={13} />
                  {step.id === 'connect' ? 'Connect Shopify' :
                   step.id === 'description' ? 'Go to Products' :
                   step.id === 'leaks' ? 'View Opportunities' : 'Check Store Health'}
                  <ArrowRight size={13} />
                </button>
              )}
              {activeStep < STEPS.length - 1 && (
                <button
                  onClick={() => setActiveStep(i => i + 1)}
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Next step →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingChecklist