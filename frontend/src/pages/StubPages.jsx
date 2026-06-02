import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle, ArrowRight, RefreshCw, Zap, ChevronDown, Lightbulb
} from 'lucide-react'

// ══════════════════════════════════════════════════════
// SCORE RING
// ══════════════════════════════════════════════════════
function HealthRing({ score }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 70 ? '#10B981' : score >= 45 ? '#F59E0B' : '#EF4444'
  const label = score >= 70 ? 'Good' : score >= 45 ? 'Needs Work' : 'Critical'

  return (
    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="1" opacity="0.2" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 5px ${color}80)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-2px' }}>{score}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>/ 100</div>
        <div style={{ fontSize: 11, fontWeight: 800, color, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
// REVENUE OPPORTUNITIES — honest, real-data only
// ══════════════════════════════════════════════════════
export function InsightsPage() {
  const [loading, setLoading]   = useState(true)
  const [findings, setFindings] = useState([])
  const [score, setScore]       = useState(0)
  const [openId, setOpenId]     = useState(null)
  const token    = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, dashRes] = await Promise.all([
        fetch('/api/products',  { headers: { Authorization: 'Bearer ' + token } }),
        fetch('/api/dashboard', { headers: { Authorization: 'Bearer ' + token } }),
      ])
      const prods = await prodRes.json()
      const dash  = await dashRes.json()
      build(Array.isArray(prods) ? prods : [], dash || {})
    } catch (e) {
      console.error(e)
      setFindings([])
    } finally {
      setLoading(false)
    }
  }

  const build = (prods, dash) => {
    const found = []
    const total = prods.length

    // 1. Weak / missing descriptions (real: description field exists)
    const weakDesc = prods.filter(p => {
      const d = (p.description || '').replace(/<[^>]*>/g, '').trim()
      return d.length < 50
    })
    if (weakDesc.length > 0) {
      found.push({
        id: 'weak-desc', severity: 'high', icon: '📝',
        title: `${weakDesc.length} ${weakDesc.length === 1 ? 'product has' : 'products have'} weak or missing descriptions`,
        detail: `Products with thin descriptions give shoppers little reason to buy. Strong, benefit-led copy is one of the most reliable ways to lift conversions — and it's a one-click fix here.`,
        fact: `${weakDesc.length} of ${total} products`,
        fix: 'Use the Product Optimizer to generate AI descriptions in one click.',
        fixPath: '/products', fixLabel: 'Optimize Now',
        products: weakDesc.slice(0, 3).map(p => p.title),
        beforeAfter: {
          before: 'Blue leather wallet. Slim design. Card slots. Ships fast.',
          after: '<strong>The slim wallet built for people who refuse to carry a brick.</strong> Full-grain leather that ages beautifully, holds 8 cards, RFID-blocking. Free shipping, 30-day returns.',
        },
      })
    }

    // 2. Missing images (real: imageUrl field exists)
    const noImg = prods.filter(p => !p.imageUrl)
    if (noImg.length > 0) {
      found.push({
        id: 'no-img', severity: 'high', icon: '🖼️',
        title: `${noImg.length} ${noImg.length === 1 ? 'product has' : 'products have'} no image`,
        detail: `Most shoppers won't buy a product they can't see. Products without images get very few sales no matter how good the copy is. Add images in your Shopify admin.`,
        fact: `${noImg.length} of ${total} products`,
        fix: 'Add product images in your Shopify admin.',
        fixPath: null, fixLabel: null,
        products: noImg.slice(0, 3).map(p => p.title),
        beforeAfter: null,
      })
    }

    // 3. Not yet optimized (real: optimizationStatus field)
    const notOpt = prods.filter(p => p.optimizationStatus && p.optimizationStatus !== 'optimized')
    if (notOpt.length > 0) {
      found.push({
        id: 'not-opt', severity: 'medium', icon: '⚡',
        title: `${notOpt.length} ${notOpt.length === 1 ? 'product hasn’t' : 'products haven’t'} been optimized yet`,
        detail: `These products haven't been through the AI optimizer. Optimizing title, description and SEO gives each product its best chance to be found and to convert.`,
        fact: `${notOpt.length} of ${total} products`,
        fix: 'Run them through the Product Optimizer.',
        fixPath: '/products', fixLabel: 'Optimize Products',
        products: notOpt.slice(0, 3).map(p => p.title),
        beforeAfter: null,
      })
    }

    // 4. One-time customers (real: from customerSegments)
    const segs = dash.customerSegments || []
    const newSeg = segs.find(s => s.name === 'New Customers')
    const totalCust = dash.totalCustomers || 0
    if (newSeg && newSeg.count > 0 && totalCust > 0) {
      found.push({
        id: 'one-time', severity: 'medium', icon: '🔁',
        title: `${newSeg.count} of your ${totalCust} customers have only ordered once`,
        detail: `Winning back an existing customer is far cheaper than finding a new one. A simple win-back email or a returning-customer offer can turn one-time buyers into repeat revenue.`,
        fact: `${newSeg.count} one-time customers`,
        fix: 'Try bundling complementary products or a free-shipping threshold.',
        fixPath: '/assistant', fixLabel: 'Ask the AI Assistant',
        products: [],
        beforeAfter: null,
      })
    }

    // 5. AOV opportunity (real: avgOrderValue)
    const aov = dash.avgOrderValue || 0
    if (aov > 0) {
      found.push({
        id: 'aov', severity: 'low', icon: '💰',
        title: `Your average order value is $${Math.round(aov).toLocaleString()}`,
        detail: `Lifting the average order is one of the fastest ways to grow revenue without new traffic. Product bundles, a free-shipping threshold, or "frequently bought together" offers are common levers.`,
        fact: `$${Math.round(aov).toLocaleString()} average order`,
        fix: 'Try bundling complementary products or a free-shipping threshold.',
        fixPath: '/recommendations', fixLabel: 'See Ideas',
        products: [],
        beforeAfter: null,
      })
    }

    // Score: start at 100, subtract for each open opportunity
    const high = found.filter(f => f.severity === 'high').length
    const med  = found.filter(f => f.severity === 'medium').length
    const s = Math.max(20, 100 - high * 18 - med * 8)

    setScore(s)
    setFindings(found)
    if (found.length > 0) setOpenId(found[0].id)
  }

  const sevColor = { high: '#EF4444', medium: '#F59E0B', low: '#6366F1' }
  const sevBg    = { high: 'rgba(239,68,68,0.08)', medium: 'rgba(245,158,11,0.08)', low: 'rgba(99,102,241,0.08)' }
  const sevLabel = { high: 'High impact', medium: 'Medium', low: 'Opportunity' }

  if (loading) return <div className="spinner" />

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1', boxShadow: '0 0 6px #6366F1' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Revenue Opportunities · Live scan of your store</span>
        </div>
        <h1 className="page-title">Revenue Opportunities</h1>
        <p className="page-sub">We scan your real store data to find specific, fixable opportunities to grow — with one-click fixes where possible.</p>
      </div>

      {/* Summary card */}
      {findings.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <HealthRing score={score} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Store opportunity score
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                We found <strong style={{ color: 'var(--text-primary)' }}>{findings.length} {findings.length === 1 ? 'opportunity' : 'opportunities'}</strong> to improve your store. Each one is based on your real product and customer data — verifiable in your Shopify admin.
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { color: '#EF4444', label: `${findings.filter(f => f.severity === 'high').length} High impact` },
                  { color: '#F59E0B', label: `${findings.filter(f => f.severity === 'medium').length} Medium` },
                  { color: '#6366F1', label: `${findings.filter(f => f.severity === 'low').length} Opportunity` },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
              <RefreshCw size={12} /> Rescan
            </button>
          </div>
        </div>
      )}

      {/* Accordion findings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {findings.length > 0 && (
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, paddingLeft: 2 }}>
            Opportunities — click to expand
          </div>
        )}
        {findings.map(f => {
          const col = sevColor[f.severity]
          const isOpen = openId === f.id
          return (
            <div key={f.id} style={{ background: 'var(--bg-secondary)', border: `1px solid ${col}25`, borderLeft: `4px solid ${col}`, borderRadius: '0 12px 12px 0', overflow: 'hidden' }}>
              <button onClick={() => setOpenId(isOpen ? null : f.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 12, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.title}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: sevBg[f.severity], color: col, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                    {sevLabel[f.severity]}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Based on</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: col }}>{f.fact}</div>
                  </div>
                  <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
                </div>
              </button>

              <div style={{ overflow: 'hidden', maxHeight: isOpen ? 900 : 0, opacity: isOpen ? 1 : 0, transition: 'max-height 0.35s ease, opacity 0.25s ease' }}>
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.detail}</p>

                  {f.products?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {f.products.map((p, j) => (
                        <span key={j} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          📦 {p}
                        </span>
                      ))}
                    </div>
                  )}

                  {f.beforeAfter && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                        Example rewrite
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: 12 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', marginBottom: 6, textTransform: 'uppercase' }}>Before</div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>{f.beforeAfter.before}</p>
                        </div>
                        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: 12 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#10B981', marginBottom: 6, textTransform: 'uppercase' }}>After — AI optimized</div>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: f.beforeAfter.after }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: `${col}08`, border: `1px solid ${col}15`, borderRadius: 8, padding: '8px 12px', flex: 1 }}>
                      <Lightbulb size={13} color={col} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <strong>Suggested fix:</strong> {f.fix}
                      </span>
                    </div>
                    {f.fixPath && (
                      <button onClick={() => navigate(f.fixPath)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: col, border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <Zap size={12} /> {f.fixLabel} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {findings.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <CheckCircle size={48} color="#10B981" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Your store looks well optimized!</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>We didn't find any major opportunities right now. Connect your store or add products to scan again.</div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════
// STORE HEALTH
// ══════════════════════════════════════════════════════
export function AutomationsPage() {
  const [loading, setLoading]           = useState(true)
  const [metrics, setMetrics]           = useState(null)
  const [products, setProducts]         = useState([])
  const [displayScore, setDisplayScore] = useState(0)
  const [animated, setAnimated]         = useState(false)

  const token    = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    setDisplayScore(0)
    setAnimated(false)
    try {
      const [dashRes, prodRes] = await Promise.all([
        fetch('/api/dashboard', { headers: { Authorization: 'Bearer ' + token } }),
        fetch('/api/products',  { headers: { Authorization: 'Bearer ' + token } }),
      ])
      const dash  = await dashRes.json()
      const prods = await prodRes.json()
      setMetrics(dash)
      setProducts(Array.isArray(prods) ? prods : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const totalProducts    = products.length
  const productsWithDesc = products.filter(p => {
    const d = (p.description || '').replace(/<[^>]*>/g, '').trim()
    return d.length > 50
  }).length
  const productsWithImg  = products.filter(p => p.imageUrl).length
  const optimized        = products.filter(p => p.optimizationStatus === 'optimized').length
  const totalRevenue     = metrics?.totalRevenue || 0

  const healthChecks = [
    {
      icon: '📝', label: 'Product Descriptions',
      score:  totalProducts > 0 ? Math.round((productsWithDesc / totalProducts) * 100) : 0,
      detail: `${productsWithDesc} of ${totalProducts} products have strong descriptions`,
      status: totalProducts > 0 && productsWithDesc === totalProducts ? 'good' : productsWithDesc > totalProducts * 0.7 ? 'warning' : 'poor',
      action: 'Optimize Descriptions', path: '/products',
    },
    {
      icon: '🖼️', label: 'Product Images',
      score:  totalProducts > 0 ? Math.round((productsWithImg / totalProducts) * 100) : 0,
      detail: `${productsWithImg} of ${totalProducts} products have images`,
      status: totalProducts > 0 && productsWithImg === totalProducts ? 'good' : productsWithImg > totalProducts * 0.8 ? 'warning' : 'poor',
      action: null, path: null,
    },
    {
      icon: '⚡', label: 'Products Optimized',
      score:  totalProducts > 0 ? Math.round((optimized / totalProducts) * 100) : 0,
      detail: `${optimized} of ${totalProducts} products optimized with AI`,
      status: totalProducts > 0 && optimized === totalProducts ? 'good' : optimized > totalProducts * 0.5 ? 'warning' : 'poor',
      action: 'Optimize Products', path: '/products',
    },
    {
      icon: '🧪', label: 'A/B Testing',
      score:  (metrics?.activeAbTests || 0) > 0 ? 100 : 20,
      detail: `${metrics?.activeAbTests || 0} active tests running`,
      status: (metrics?.activeAbTests || 0) > 0 ? 'good' : 'poor',
      action: 'Start A/B Test', path: '/abtesting',
    },
    {
      icon: '🤖', label: 'AI Recommendations',
      score:  (metrics?.aiSuggestions || 0) > 0 ? 70 : 30,
      detail: `${metrics?.aiSuggestions || 0} recommendations available`,
      status: (metrics?.aiSuggestions || 0) > 0 ? 'warning' : 'poor',
      action: 'View Recommendations', path: '/recommendations',
    },
  ]

  const overallScore = totalProducts > 0 ? Math.round(
    healthChecks.reduce((sum, c) => sum + c.score, 0) / healthChecks.length
  ) : 0

  useEffect(() => {
    if (overallScore === 0 || loading) return
    const startDelay = setTimeout(() => {
      setAnimated(true)
      let current = 0
      const steps = 60
      const stepTime = 1400 / steps
      const increment = overallScore / steps
      const timer = setInterval(() => {
        current += increment
        if (current >= overallScore) { setDisplayScore(overallScore); clearInterval(timer) }
        else setDisplayScore(Math.round(current))
      }, stepTime)
      return () => clearInterval(timer)
    }, 150)
    return () => clearTimeout(startDelay)
  }, [overallScore, loading])

  const scoreColor  = overallScore >= 80 ? '#10B981' : overallScore >= 60 ? '#F59E0B' : '#EF4444'
  const scoreLabel  = overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Needs Work' : 'Critical'
  const statusColor = { good: '#10B981', warning: '#F59E0B', poor: '#EF4444' }
  const statusBg    = { good: 'rgba(16,185,129,0.08)', warning: 'rgba(245,158,11,0.08)', poor: 'rgba(239,68,68,0.08)' }
  const statusLabel = { good: '✅ Good', warning: '⚠️ Needs Attention', poor: '❌ Critical' }
  const arcProgress = 2 * Math.PI * 54
  const arcOffset   = arcProgress * (1 - displayScore / 100)

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Store Health</h1>
        <p className="page-sub">A complete health check of your Shopify store — see what's working and what needs fixing.</p>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', flexShrink: 0, width: 140 }}>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="54" fill="none" stroke={scoreColor} strokeWidth="1" opacity="0.2" />
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle cx="70" cy="70" r="54" fill="none" stroke={scoreColor} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={arcProgress} strokeDashoffset={arcOffset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', filter: `drop-shadow(0 0 5px ${scoreColor}80)` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: scoreColor, lineHeight: 1, letterSpacing: '-2px' }}>{displayScore}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 3 }}>out of 100</div>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800, color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{scoreLabel}</div>
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Overall Store Health Score</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Based on {totalProducts} products — descriptions, images, optimization status, A/B testing and recommendations.
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Good',     count: healthChecks.filter(c => c.status === 'good').length,    color: '#10B981' },
              { label: 'Warning',  count: healthChecks.filter(c => c.status === 'warning').length, color: '#F59E0B' },
              { label: 'Critical', count: healthChecks.filter(c => c.status === 'poor').length,    color: '#EF4444' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.count} {s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total Revenue</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#10B981' }}>${totalRevenue.toLocaleString()}</div>
          <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', marginTop: 12, marginLeft: 'auto' }}>
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {healthChecks.map((check, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: `1px solid ${statusColor[check.status]}20`, borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{check.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{check.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{check.detail}</div>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap', background: statusBg[check.status], color: statusColor[check.status] }}>
                {statusLabel[check.status]}
              </span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ height: '100%', width: animated ? `${check.score}%` : '0%', background: statusColor[check.status], borderRadius: 3, transition: animated ? `width 1.2s ease ${i * 0.1}s` : 'none' }} />
            </div>
            {check.action && check.path && (
              <button onClick={() => navigate(check.path)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${statusColor[check.status]}30`, borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: statusColor[check.status], cursor: 'pointer' }}>
                {check.action} <ArrowRight size={10} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}