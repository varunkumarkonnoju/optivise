import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingDown, CheckCircle, ArrowRight, RefreshCw
} from 'lucide-react'

// ══════════════════════════════════════════════════════
// REVENUE LEAK DETECTOR
// ══════════════════════════════════════════════════════
export function InsightsPage() {
  const [loading, setLoading]     = useState(true)
  const [leaks, setLeaks]         = useState([])
  const [totalLeak, setTotalLeak] = useState(0)
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
      calculateLeaks(Array.isArray(prods) ? prods : [], dash)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const calculateLeaks = (prods, dash) => {
    const detected = []
    let totalLoss  = 0

    const noDesc = prods.filter(p => !p.description || p.description.trim().length < 50)
    if (noDesc.length > 0) {
      const est = noDesc.length * 180
      totalLoss += est
      detected.push({
        id: 'no-description', severity: 'high', icon: '📝',
        title:   `${noDesc.length} products have weak or no descriptions`,
        detail:  `Products without compelling descriptions lose 30-40% of potential buyers. Visitors land on your page, see no reason to buy, and leave.`,
        impact:  est,
        fix:     'Use Product Optimizer to generate AI descriptions in 1 click',
        fixPath: '/products', fixLabel: 'Fix Now →',
        products: noDesc.slice(0, 3).map(p => p.title),
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
        fix:     'Review these products — improve descriptions, lower price or remove them',
        fixPath: '/products', fixLabel: 'Review Products →',
        products: zeroRev.slice(0, 3).map(p => p.title),
      })
    }

    const convRate = dash?.conversionRate || 0
    if (convRate > 0 && convRate < 2.0) {
      const est = Math.round((dash?.totalRevenue || 1000) * 0.4)
      totalLoss += est
      detected.push({
        id: 'low-conversion', severity: 'high', icon: '📉',
        title:   `Your conversion rate is ${convRate.toFixed(1)}% — industry average is 2.5%`,
        detail:  `For every 100 visitors, only ${convRate.toFixed(1)} buy. If you hit 2.5% you'd make ${Math.round((2.5 - convRate) / convRate * 100)}% more revenue without any extra traffic.`,
        impact:  est,
        fix:     'Run A/B tests on your top products to find what converts better',
        fixPath: '/abtesting', fixLabel: 'Start A/B Test →',
        products: [],
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
        fix:     'Add product images in your Shopify admin immediately',
        fixPath: null, fixLabel: null,
        products: noImage.slice(0, 3).map(p => p.title),
      })
    }

    const aov = dash?.averageOrderValue || 0
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
          fix:     'Test a 15-20% price increase on your best sellers — use A/B testing',
          fixPath: '/abtesting', fixLabel: 'Test Price →',
          products: underpriced.slice(0, 3).map(p => p.title),
        })
      }
    }

    detected.push({
      id: 'recommendations', severity: 'low', icon: '💡',
      title:   `You have unread AI growth recommendations`,
      detail:  `Optivise generates personalized recommendations based on your real store data. Each recommendation has an estimated revenue impact.`,
      impact:  300,
      fix:     'Review your AI recommendations and act on the top 3',
      fixPath: '/recommendations', fixLabel: 'View Recommendations →',
      products: [],
    })
    totalLoss += 300
    setLeaks(detected)
    setTotalLeak(totalLoss)
  }

  const severityColor = { high: '#EF4444', medium: '#F59E0B', low: '#6366F1' }
  const severityBg    = { high: 'rgba(239,68,68,0.08)', medium: 'rgba(245,158,11,0.08)', low: 'rgba(99,102,241,0.08)' }

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Revenue Leak Detector
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          AI scans your real store data to find exactly where you're losing money — and how to fix it.
        </p>
      </div>

      {totalLeak > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 14, padding: '20px 24px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={22} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#EF4444' }}>
                ~${totalLeak.toLocaleString()}/month
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                estimated revenue you're currently losing — {leaks.length} leaks detected
              </div>
            </div>
          </div>
          <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>
            <RefreshCw size={12} /> Rescan
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {leaks.map((leak) => (
          <div key={leak.id} style={{
            background: 'var(--bg-secondary)',
            border: `1px solid ${severityColor[leak.severity]}30`,
            borderLeft: `4px solid ${severityColor[leak.severity]}`,
            borderRadius: 12, padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{leak.icon}</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{leak.title}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', background: severityBg[leak.severity], color: severityColor[leak.severity], border: `1px solid ${severityColor[leak.severity]}30` }}>
                    {leak.severity}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
                  {leak.detail}
                </p>
                {leak.products?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {leak.products.map((p, j) => (
                      <span key={j} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        📦 {p}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${severityColor[leak.severity]}08`, border: `1px solid ${severityColor[leak.severity]}15`, borderRadius: 8, padding: '8px 12px' }}>
                  <CheckCircle size={13} color={severityColor[leak.severity]} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong>Fix:</strong> {leak.fix}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Est. monthly loss</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: severityColor[leak.severity], marginBottom: 12 }}>
                  ~${leak.impact.toLocaleString()}
                </div>
                {leak.fixPath && (
                  <button onClick={() => navigate(leak.fixPath)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: severityColor[leak.severity], border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {leak.fixLabel} <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

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

  // ── ALL HOOKS AT TOP — never move these ─────────────
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

  // ── DERIVED VALUES ───────────────────────────────────
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

  // ── SCORE COUNTER ANIMATION ──────────────────────────
  // Runs after data loads, counts from 0 to overallScore
  // Progress bars use `animated` state to trigger CSS transition
  useEffect(() => {
    if (overallScore === 0 || loading) return

    // Short delay so component renders at 0 first
    const startDelay = setTimeout(() => {
      setAnimated(true) // triggers progress bars

      let current = 0
      const total    = overallScore
      const duration = 1400  // ms
      const steps    = 60
      const stepTime = duration / steps
      const increment = total / steps

      const timer = setInterval(() => {
        current += increment
        if (current >= total) {
          setDisplayScore(total)
          clearInterval(timer)
        } else {
          setDisplayScore(Math.round(current))
        }
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

  // Arc progress — driven by displayScore (0 → overallScore)
  const arcProgress   = 2 * Math.PI * 54
  const arcOffset     = arcProgress * (1 - displayScore / 100)

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Store Health
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          A complete health check of your Shopify store — see what's working and what needs fixing.
        </p>
      </div>

      {/* Overall score card */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24,
      }}>

        {/* Premium animated score circle */}
        <div style={{ textAlign: 'center', flexShrink: 0, width: 140 }}>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              {/* Outer glow ring */}
              <circle cx="70" cy="70" r="54" fill="none"
                stroke={scoreColor} strokeWidth="1" opacity="0.2"/>
              {/* Track */}
              <circle cx="70" cy="70" r="54" fill="none"
                stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
              {/* Animated progress arc — driven by displayScore via JS */}
              <circle cx="70" cy="70" r="54" fill="none"
                stroke={scoreColor} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={arcProgress}
                strokeDashoffset={arcOffset}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '70px 70px',
                  filter: `drop-shadow(0 0 5px ${scoreColor}80)`,
                }}
              />
            </svg>

            {/* Score number — centered perfectly */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                fontSize: 40, fontWeight: 900,
                color: scoreColor, lineHeight: 1,
                letterSpacing: '-2px',
                transition: 'color 0.3s ease',
              }}>
                {displayScore}
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text-muted)',
                fontWeight: 600, letterSpacing: '0.05em',
                marginTop: 3,
              }}>
                out of 100
              </div>
            </div>
          </div>

          {/* Label below circle */}
          <div style={{
            marginTop: 10, fontSize: 12, fontWeight: 800,
            color: scoreColor, letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {scoreLabel}
          </div>
        </div>

        {/* Summary text */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Overall Store Health Score
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Based on {totalProducts} products, conversion rate, descriptions,
            images and AI optimization status.
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
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

        {/* Revenue + refresh */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total Revenue</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#10B981' }}>
            ${totalRevenue.toLocaleString()}
          </div>
          <button onClick={fetchData} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 12px',
            fontSize: 11, fontWeight: 600,
            color: 'var(--text-muted)', cursor: 'pointer',
            marginTop: 12, marginLeft: 'auto',
          }}>
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </div>

      {/* Health check cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {healthChecks.map((check, i) => (
          <div key={i} style={{
            background: 'var(--bg-secondary)',
            border: `1px solid ${statusColor[check.status]}20`,
            borderRadius: 12, padding: '16px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{check.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{check.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{check.detail}</div>
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px',
                borderRadius: 20, whiteSpace: 'nowrap',
                background: statusBg[check.status],
                color: statusColor[check.status],
              }}>
                {statusLabel[check.status]}
              </span>
            </div>

            {/* Progress bar — starts at 0, animates to score when `animated` = true */}
            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{
                height: '100%',
                width: animated ? `${check.score}%` : '0%',
                background: statusColor[check.status],
                borderRadius: 3,
                transition: animated ? `width 1.2s ease ${i * 0.1}s` : 'none',
              }} />
            </div>

            {check.action && check.path && (
              <button
                onClick={() => navigate(check.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none',
                  border: `1px solid ${statusColor[check.status]}30`,
                  borderRadius: 6, padding: '5px 10px',
                  fontSize: 11, fontWeight: 600,
                  color: statusColor[check.status], cursor: 'pointer',
                }}
              >
                {check.action} <ArrowRight size={10} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}