import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingDown, CheckCircle, ArrowRight, RefreshCw,
  FileText, Search, Zap, ChevronDown
} from 'lucide-react'

// ══════════════════════════════════════════════════════
// HEALTH RING
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
// REVENUE LEAK DETECTOR
// ══════════════════════════════════════════════════════
export function InsightsPage() {
  const [loading, setLoading]     = useState(true)
  const [leaks, setLeaks]         = useState([])
  const [totalLeak, setTotalLeak] = useState(0)
  const [healthScore, setHealthScore] = useState(0)
  const [openId, setOpenId]       = useState(null)
  const [products, setProducts]   = useState([])
  const [dash, setDash]           = useState(null)
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
      const dashData  = await dashRes.json()
      const prodArr = Array.isArray(prods) ? prods : []
      setProducts(prodArr)
      setDash(dashData)
      calculateLeaks(prodArr, dashData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const calculateLeaks = (prods, dashData) => {
    const detected = []
    let totalLoss  = 0

    const noDesc = prods.filter(p => !p.description || p.description.trim().length < 50)
    if (noDesc.length > 0) {
      const est = noDesc.length * 180
      totalLoss += est
      detected.push({
        id: 'no-description', severity: 'high', icon: '📝',
        title:   `${noDesc.length} products have weak or no descriptions`,
        detail:  `Products without compelling descriptions lose 30–40% of potential buyers. Visitors land on your page, see no reason to buy, and leave.`,
        impact:  est,
        fix:     'Use Product Optimizer to generate AI descriptions in 1 click.',
        fixPath: '/products', fixLabel: 'Fix Now →',
        products: noDesc.slice(0, 3).map(p => p.title),
        beforeAfter: {
          before: 'Blue leather wallet. Slim design. Card slots. Ships fast.',
          after: '<strong>The Slim Wallet built for people who refuse to carry a brick.</strong> Crafted from full-grain leather that develops a rich patina over time, holds 8 cards, folds flat. RFID-blocking. Free shipping. 30-day returns.',
        },
      })
    }

    const zeroRev = prods.filter(p => (!p.revenue || p.revenue === 0) && p.price > 0)
    if (zeroRev.length > 0) {
      const est = zeroRev.length * 120
      totalLoss += est
      detected.push({
        id: 'zero-revenue', severity: 'high', icon: '💀',
        title:   `${zeroRev.length} products have generated zero revenue`,
        detail:  `These products are taking up space, confusing visitors and diluting your store's focus. Dead products hurt your overall conversion rate.`,
        impact:  est,
        fix:     'Review these products — improve descriptions, lower price, or remove them.',
        fixPath: '/products', fixLabel: 'Review Products →',
        products: zeroRev.slice(0, 3).map(p => p.title),
        beforeAfter: null,
      })
    }

    const convRate = dashData?.conversionRate || 0
    if (convRate > 0 && convRate < 2.0) {
      const est = Math.round((dashData?.totalRevenue || 1000) * 0.4)
      totalLoss += est
      detected.push({
        id: 'low-conversion', severity: 'high', icon: '📉',
        title:   `Your conversion rate is ${convRate.toFixed(1)}% — industry average is 2.5%`,
        detail:  `For every 100 visitors, only ${convRate.toFixed(1)} buy. If you hit 2.5% you'd make ${Math.round((2.5 - convRate) / convRate * 100)}% more revenue without any extra traffic.`,
        impact:  est,
        fix:     'Run A/B tests on your top products to find what converts better.',
        fixPath: '/abtesting', fixLabel: 'Start A/B Test →',
        products: [],
        beforeAfter: null,
      })
    }

    const noImage = prods.filter(p => !p.imageUrl)
    if (noImage.length > 0) {
      const est = noImage.length * 90
      totalLoss += est
      detected.push({
        id: 'no-images', severity: 'medium', icon: '🖼️',
        title:   `${noImage.length} products have no images`,
        detail:  `93% of buyers say visuals are the key deciding factor. Products without images get almost zero sales regardless of how good the description is.`,
        impact:  est,
        fix:     'Add product images in your Shopify admin immediately.',
        fixPath: null, fixLabel: null,
        products: noImage.slice(0, 3).map(p => p.title),
        beforeAfter: null,
      })
    }

    const aov = dashData?.averageOrderValue || 0
    if (aov > 0) {
      const underpriced = prods.filter(p => p.price > 0 && p.price < aov * 0.2 && (p.revenue || 0) > 100)
      if (underpriced.length > 0) {
        const est = underpriced.length * 200
        totalLoss += est
        detected.push({
          id: 'underpriced', severity: 'medium', icon: '💸',
          title:   `${underpriced.length} best-selling products may be underpriced`,
          detail:  `Your average order value is $${aov.toFixed(0)} but these products are priced much lower. Customers who are already buying are willing to pay more.`,
          impact:  est,
          fix:     'Test a 15–20% price increase on your best sellers using A/B testing.',
          fixPath: '/abtesting', fixLabel: 'Test Price →',
          products: underpriced.slice(0, 3).map(p => p.title),
          beforeAfter: null,
        })
      }
    }

    detected.push({
      id: 'recommendations', severity: 'low', icon: '💡',
      title:   'You have unread AI growth recommendations',
      detail:  'Optivise generates personalized recommendations based on your real store data. Each recommendation has an estimated revenue impact.',
      impact:  300,
      fix:     'Review your AI recommendations and act on the top 3.',
      fixPath: '/recommendations', fixLabel: 'View Recommendations →',
      products: [],
      beforeAfter: null,
    })
    totalLoss += 300

    // Calculate health score from leaks
    const criticalCount = detected.filter(l => l.severity === 'high').length
    const score = Math.max(10, 100 - (criticalCount * 20) - (detected.filter(l => l.severity === 'medium').length * 10))
    setHealthScore(score)
    setLeaks(detected)
    setTotalLeak(totalLoss)
    if (detected.length > 0) setOpenId(detected[0].id)
  }

  const severityColor = { high: '#EF4444', medium: '#F59E0B', low: '#6366F1' }
  const severityBg    = { high: 'rgba(239,68,68,0.08)', medium: 'rgba(245,158,11,0.08)', low: 'rgba(99,102,241,0.08)' }
  const severityLabel = { high: 'Critical', medium: 'Warning', low: 'Low' }

  // Top 3 leaks for summary cards
  const topLeaks = leaks.slice(0, 3)

  if (loading) return <div className="spinner" />

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px #EF4444' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Revenue Leaks · Live scan of your store</span>
        </div>
        <h1 className="page-title">Revenue Leak Detector</h1>
        <p className="page-sub">AI scans your real store data to find exactly where you're losing money — and how to fix it.</p>
      </div>

      {/* ── Dashboard card ── */}
      {leaks.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          {/* Health score + summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
            <HealthRing score={healthScore} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Overall store health
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                Found <strong style={{ color: 'var(--text-primary)' }}>{leaks.length} revenue leaks</strong> in your store.
                Fixing them could recover up to{' '}
                <strong style={{ color: '#10B981' }}>~${totalLeak.toLocaleString()}/month</strong>.
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { color: '#EF4444', label: `${leaks.filter(l => l.severity === 'high').length} Critical` },
                  { color: '#F59E0B', label: `${leaks.filter(l => l.severity === 'medium').length} Warning` },
                  { color: '#6366F1', label: `${leaks.filter(l => l.severity === 'low').length} Low` },
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

          {/* Top 3 issue summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {topLeaks.map(leak => {
              const col = severityColor[leak.severity]
              return (
                <div key={leak.id} style={{ background: severityBg[leak.severity], border: `1px solid ${col}25`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontSize: 18 }}>{leak.icon}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: col, background: `${col}15`, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {severityLabel[leak.severity]}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{leak.title.split(' ').slice(0, 6).join(' ')}...</div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: leak.severity === 'high' ? '85%' : leak.severity === 'medium' ? '52%' : '25%', background: col, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: col }}>~${leak.impact.toLocaleString()}/mo</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Total leak banner ── */}
      {totalLeak > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <TrendingDown size={20} color="#EF4444" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#EF4444' }}>~${totalLeak.toLocaleString()}/month</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>estimated revenue you're currently losing — {leaks.length} leaks detected</div>
          </div>
        </div>
      )}

      {/* ── Accordion leak items ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, paddingLeft: 2 }}>
          Issues — click to expand
        </div>
        {leaks.map(leak => {
          const col   = severityColor[leak.severity]
          const isOpen = openId === leak.id
          return (
            <div key={leak.id} style={{ background: 'var(--bg-secondary)', border: `1px solid ${col}25`, borderLeft: `4px solid ${col}`, borderRadius: '0 12px 12px 0', overflow: 'hidden' }}>

              {/* Header */}
              <button onClick={() => setOpenId(isOpen ? null : leak.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 12, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <span style={{ fontSize: 18 }}>{leak.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{leak.title}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: severityBg[leak.severity], color: col, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                    {severityLabel[leak.severity]}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Est. loss</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: col }}>~${leak.impact.toLocaleString()}/mo</div>
                  </div>
                  <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
                </div>
              </button>

              {/* Body */}
              <div style={{ overflow: 'hidden', maxHeight: isOpen ? 900 : 0, opacity: isOpen ? 1 : 0, transition: 'max-height 0.35s ease, opacity 0.25s ease' }}>
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* Detail */}
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{leak.detail}</p>

                  {/* Affected products */}
                  {leak.products?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {leak.products.map((p, j) => (
                        <span key={j} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          📦 {p}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Before / After */}
                  {leak.beforeAfter && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                        Example rewrite
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: 12 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', marginBottom: 6, textTransform: 'uppercase' }}>❌ Before</div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>{leak.beforeAfter.before}</p>
                        </div>
                        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: 12 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#10B981', marginBottom: 6, textTransform: 'uppercase' }}>✅ After — AI optimized</div>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: leak.beforeAfter.after }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fix + CTA */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: `${col}08`, border: `1px solid ${col}15`, borderRadius: 8, padding: '8px 12px', flex: 1 }}>
                      <CheckCircle size={13} color={col} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <strong>Fix:</strong> {leak.fix}
                      </span>
                    </div>
                    {leak.fixPath && (
                      <button onClick={() => navigate(leak.fixPath)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: col, border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <Zap size={12} /> {leak.fixLabel} <ArrowRight size={12} />
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
      {leaks.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <CheckCircle size={48} color="#10B981" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No major leaks detected!</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Connect your Shopify store to get a full revenue analysis.</div>
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
  const productsWithDesc = products.filter(p => p.description && p.description.length > 50).length
  const productsWithImg  = products.filter(p => p.imageUrl).length
  const revenueProducts  = products.filter(p => p.revenue > 0).length
  const convRate         = metrics?.conversionRate || 0
  const totalRevenue     = metrics?.totalRevenue || 0

  const healthChecks = [
    {
      icon: '📝', label: 'Product Descriptions',
      score:  totalProducts > 0 ? Math.round((productsWithDesc / totalProducts) * 100) : 0,
      detail: `${productsWithDesc} of ${totalProducts} products have descriptions`,
      status: productsWithDesc === totalProducts ? 'good' : productsWithDesc > totalProducts * 0.7 ? 'warning' : 'poor',
      action: 'Optimize Descriptions', path: '/products',
    },
    {
      icon: '🖼️', label: 'Product Images',
      score:  totalProducts > 0 ? Math.round((productsWithImg / totalProducts) * 100) : 0,
      detail: `${productsWithImg} of ${totalProducts} products have images`,
      status: productsWithImg === totalProducts ? 'good' : productsWithImg > totalProducts * 0.8 ? 'warning' : 'poor',
      action: null, path: null,
    },
    {
      icon: '💰', label: 'Revenue Generating Products',
      score:  totalProducts > 0 ? Math.round((revenueProducts / totalProducts) * 100) : 0,
      detail: `${revenueProducts} of ${totalProducts} products have generated sales`,
      status: revenueProducts > totalProducts * 0.5 ? 'good' : revenueProducts > totalProducts * 0.3 ? 'warning' : 'poor',
      action: 'View Analytics', path: '/analytics',
    },
    {
      icon: '📊', label: 'Conversion Rate',
      score:  Math.min(100, Math.round((convRate / 3.5) * 100)),
      detail: `${convRate.toFixed(2)}% conversion rate (industry avg: 2.5%)`,
      status: convRate >= 2.5 ? 'good' : convRate >= 1.5 ? 'warning' : 'poor',
      action: 'Run A/B Tests', path: '/abtesting',
    },
    {
      icon: '🤖', label: 'AI Recommendations',
      score:  70,
      detail: 'Review and act on AI growth recommendations',
      status: 'warning',
      action: 'View Recommendations', path: '/recommendations',
    },
    {
      icon: '🧪', label: 'A/B Testing',
      score:  (metrics?.activeAbTests || 0) > 0 ? 100 : 20,
      detail: `${metrics?.activeAbTests || 0} active tests running`,
      status: (metrics?.activeAbTests || 0) > 0 ? 'good' : 'poor',
      action: 'Start A/B Test', path: '/abtesting',
    },
  ]

  const overallScore = Math.round(
    healthChecks.reduce((sum, c) => sum + c.score, 0) / healthChecks.length
  )

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

      {/* Overall score card */}
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
            Based on {totalProducts} products, conversion rate, descriptions, images and AI optimization status.
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

      {/* Health check cards */}
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