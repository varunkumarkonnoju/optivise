import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Zap, ArrowRight, RefreshCw } from 'lucide-react'

// ── REAL DATA DIAGNOSIS ENGINE ────────────────────────
const buildDiagnosis = (prods, dash) => {
  const products     = Array.isArray(prods) ? prods : []
  const total        = products.length
  const totalRevenue = parseFloat(dash?.totalRevenue || 0)
  const convRate     = parseFloat(dash?.conversionRate || 0)

  // ── Weak descriptions ────────────────────────────────
  const weakDesc = products.filter(p => {
    const text = (p.description || '').replace(/<[^>]*>/g, '').trim()
    return text.length < 100
  })

  // ── Zero revenue products ────────────────────────────
  const zeroRev = products.filter(p => !p.revenue || p.revenue === 0)

  // ── Best / worst revenue products ───────────────────
  const sorted = [...products].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
  const topProduct = sorted[0]

  // ── Build real before text from first weak product ──
  const firstWeak = weakDesc[0]
  const beforeAfter = firstWeak ? {
    before: (() => {
      const text = (firstWeak.description || '').replace(/<[^>]*>/g, '').trim()
      return text.length > 10 ? text.substring(0, 140) + '...' : `${firstWeak.title}. Available now.`
    })(),
    after: `<strong>${firstWeak.title} — crafted for people who demand quality.</strong> Every detail considered, built to last. Whether you're buying for yourself or as a gift, this is the one you'll reach for every time. Free shipping on all orders. 30-day no-questions returns.`,
  } : null

  // ── Scores ───────────────────────────────────────────
  const descPenalty  = total > 0 ? (weakDesc.length / total) * 30 : 0
  const convPenalty  = convRate > 0 && convRate < 2.5 ? ((2.5 - convRate) / 2.5) * 20 : 0
  const revPenalty   = total > 0 ? (zeroRev.length / total) * 15 : 0
  const healthScore  = Math.round(Math.max(20, Math.min(95, 100 - descPenalty - convPenalty - revPenalty)))

  // ── Issue: Descriptions ──────────────────────────────
  const descImpact   = weakDesc.length * 180
  const descSeverity = weakDesc.length === 0 ? 'good'
    : weakDesc.length > total * 0.4 ? 'critical' : 'warning'

  // ── Issue: Zero revenue ──────────────────────────────
  const revImpact   = zeroRev.length * 130
  const revSeverity = zeroRev.length === 0 ? 'good'
    : zeroRev.length > total * 0.5 ? 'critical' : 'warning'

  // ── Issue: Conversion ────────────────────────────────
  const convAboveAvg  = convRate >= 2.5
  const convImpact    = !convAboveAvg && convRate > 0 && totalRevenue > 0
    ? Math.round(totalRevenue * ((2.5 - convRate) / 2.5) * 0.5)
    : 0
  const convSeverity  = convRate === 0 ? 'warning'
    : convRate >= 2.5 ? 'good'
    : convRate >= 1.5 ? 'warning' : 'critical'

  const convWhy = convRate === 0
    ? 'Connect your Shopify store and start getting orders — we\'ll calculate your real conversion rate and show you exactly how it compares to the industry average.'
    : convAboveAvg
    ? `Your conversion rate of ${convRate.toFixed(2)}% beats the industry average of 2.5%. You're converting better than most Shopify stores. Keep testing and optimising to push it even higher.`
    : `For every 100 visitors, only ${convRate.toFixed(1)} buy. The industry average is 2.5% — if you hit that, your revenue would increase by roughly ${Math.round((2.5 - convRate) / Math.max(convRate, 0.01) * 100)}% without spending a single extra dollar on ads.`

  const convRecommendedRevenue = convRate > 0 && !convAboveAvg
    ? Math.round(totalRevenue * (2.5 / Math.max(convRate, 0.01)))
    : 0

  const issues = [
    {
      id: 'descriptions',
      icon: '📝',
      title: 'Weak Product Descriptions',
      severity: descSeverity,
      stat: weakDesc.length === 0
        ? `All ${total} products`
        : `${weakDesc.length} of ${total} products`,
      statDetail: weakDesc.length === 0
        ? 'have strong descriptions ✅'
        : 'have thin or missing copy',
      impact: descImpact,
      affectedProducts: weakDesc.slice(0, 5).map(p => p.title),
      why: weakDesc.length === 0
        ? 'All your products have solid descriptions. Keep them updated as you add new products and review them every 3 months.'
        : `${weakDesc.length} product${weakDesc.length > 1 ? 's' : ''} — ${weakDesc.slice(0, 2).map(p => p.title).join(', ')}${weakDesc.length > 2 ? ` and ${weakDesc.length - 2} more` : ''} — have descriptions under 100 characters. Short copy fails to answer buyer questions, hurts SEO ranking, and gives visitors no reason to add to cart.`,
      fix: weakDesc.length === 0
        ? 'Your descriptions are in good shape! Consider A/B testing different copy styles on your top products to squeeze out more conversions.'
        : 'Rewrite each affected description to at least 150 words. Lead with the customer\'s problem, follow with specific benefits, and close with a clear reason to buy today. Optivise generates optimized rewrites in one click.',
      actionLabel: weakDesc.length === 0 ? 'View Products' : 'Fix with AI',
      actionPath: '/products',
      beforeAfter: weakDesc.length > 0 ? beforeAfter : null,
    },
    {
      id: 'revenue',
      icon: '💀',
      title: 'Dead Products — Zero Revenue',
      severity: revSeverity,
      stat: zeroRev.length === 0
        ? 'All products selling'
        : `${zeroRev.length} of ${total} products`,
      statDetail: zeroRev.length === 0
        ? 'have generated revenue ✅'
        : 'have generated zero revenue',
      impact: revImpact,
      affectedProducts: zeroRev.slice(0, 5).map(p => p.title),
      why: zeroRev.length === 0
        ? 'Every product in your store has generated revenue. Excellent inventory management — keep monitoring for products that stop selling.'
        : `${zeroRev.slice(0, 2).map(p => p.title).join(', ')}${zeroRev.length > 2 ? ` and ${zeroRev.length - 2} more` : ''} — have never sold. Dead products confuse visitors, dilute your store focus, and hurt overall conversion rate. Every low-quality page a visitor sees lowers their trust in your store.`,
      fix: zeroRev.length === 0
        ? 'Keep an eye on products that stop selling. If a product hasn\'t sold in 60 days, consider refreshing its description and images, or running a sale.'
        : 'For each zero-revenue product: first improve the description and images. If still no sales after 30 days, consider removing or repricing. Use Optivise A/B testing to find the right price.',
      actionLabel: zeroRev.length === 0 ? 'View Analytics' : 'Review Products',
      actionPath: zeroRev.length === 0 ? '/analytics' : '/products',
      beforeAfter: null,
    },
    {
      id: 'conversion',
      icon: convAboveAvg ? '📈' : '📉',
      title: 'Conversion Rate',
      severity: convSeverity,
      stat: convRate > 0 ? `${convRate.toFixed(2)}% conversion` : 'No data yet',
      statDetail: convRate === 0
        ? 'connect store to measure'
        : convAboveAvg
        ? `${(convRate - 2.5).toFixed(1)}% above industry average ✅`
        : `industry average is 2.5%`,
      impact: convImpact,
      affectedProducts: [],
      why: convWhy,
      fix: convAboveAvg
        ? 'You\'re already above average. To push further: run A/B tests on your top 3 products, add urgency elements (limited stock, countdown timers), and test different price points with Optivise A/B testing.'
        : 'Add trust badges (secure checkout, free returns, money-back guarantee) near your Add to Cart button. Display shipping cost on the product page. Run A/B tests on your top products — even a 0.5% lift in conversion significantly increases revenue.',
      extraInfo: convRecommendedRevenue > 0
        ? `At 2.5% conversion your revenue could be $${convRecommendedRevenue.toLocaleString()} vs current $${Math.round(totalRevenue).toLocaleString()}`
        : null,
      actionLabel: convAboveAvg ? 'Keep Optimising' : 'Run A/B Tests',
      actionPath: '/abtesting',
      beforeAfter: null,
    },
  ]

  // Sort: critical first, then warning, then good
  const order = { critical: 0, warning: 1, good: 2 }
  issues.sort((a, b) => order[a.severity] - order[b.severity])

  const totalRecoverable = issues.reduce((s, i) => s + i.impact, 0)
  const topIssue = issues.find(i => i.severity !== 'good') || issues[0]

  return {
    healthScore, totalRecoverable, issues, topIssue,
    totalProducts: total, totalRevenue,
    topProduct, convRate,
  }
}

const SEVERITY = {
  critical: { label: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  bar: '#EF4444' },
  warning:  { label: 'Warning',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', bar: '#F59E0B' },
  good:     { label: 'Good',     color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', bar: '#10B981' },
}

// ── HEALTH RING ───────────────────────────────────────
function HealthRing({ score, animated }) {
  const r     = 54
  const circ  = 2 * Math.PI * r
  const offset = animated ? circ * (1 - score / 100) : circ
  const color  = score >= 70 ? '#10B981' : score >= 45 ? '#F59E0B' : '#EF4444'
  const label  = score >= 70 ? 'Good' : score >= 45 ? 'Needs Work' : 'Critical'
  return (
    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="1" opacity="0.15" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dashoffset 1.4s ease', filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 34, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-2px' }}>{score}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>/ 100</div>
        <div style={{ fontSize: 11, fontWeight: 800, color, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      </div>
    </div>
  )
}

// ── SCANNING ANIMATION ────────────────────────────────
function ScanningScreen({ shopDomain, productCount }) {
  const [step, setStep] = useState(0)
  const steps = [
    { label: 'Connecting to your Shopify store...', icon: '🔗' },
    { label: productCount > 0 ? `Found ${productCount} products...` : 'Loading products...', icon: '📦' },
    { label: 'Scanning product descriptions...', icon: '📝' },
    { label: 'Analysing revenue per product...', icon: '💰' },
    { label: 'Checking conversion metrics...', icon: '📊' },
    { label: 'Calculating your diagnosis...', icon: '🧠' },
  ]
  useEffect(() => {
    const t = setInterval(() => setStep(s => s < steps.length - 1 ? s + 1 : s), 480)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Diagnosing your store</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{shopDomain}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.4s ease' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: i < step ? 'rgba(16,185,129,0.15)' : i === step ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)',
              border: `1px solid ${i < step ? '#10B98150' : i === step ? 'var(--purple)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
              transition: 'all 0.3s ease',
            }}>
              {i < step ? '✓' : s.icon}
            </div>
            <div style={{ fontSize: 13, color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div style={{ width: 280, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--purple), #818cf8)', borderRadius: 2, transition: 'width 0.5s ease', width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Takes about 3 seconds...</div>
    </div>
  )
}

// ── ISSUE SUMMARY CARD ────────────────────────────────
function IssueCard({ issue, active, onClick }) {
  const s = SEVERITY[issue.severity]
  const barW = issue.severity === 'critical' ? '85%' : issue.severity === 'warning' ? '52%' : '15%'
  return (
    <div onClick={onClick} style={{
      background: active ? s.bg : 'var(--bg-secondary)',
      border: `1px solid ${active ? s.border : 'var(--border)'}`,
      borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
      cursor: 'pointer', transition: 'all 0.2s ease',
      outline: active ? `1px solid ${s.color}40` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 18 }}>{issue.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 800, color: s.color, background: `${s.bar}18`, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {s.label}
        </span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{issue.title}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{issue.stat}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{issue.statDetail}</div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: barW, background: s.bar, borderRadius: 2 }} />
      </div>
      {issue.impact > 0
        ? <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>~${issue.impact.toLocaleString()}/mo impact</div>
        : <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>No revenue impact ✅</div>
      }
    </div>
  )
}

// ── ACCORDION ─────────────────────────────────────────
function AccordionItem({ issue, isOpen, onToggle }) {
  const s = SEVERITY[issue.severity]
  const navigate = useNavigate()
  return (
    <div style={{ border: `1px solid ${s.color}25`, borderLeft: `4px solid ${s.color}`, borderRadius: '0 12px 12px 0', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{issue.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</span>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: SEVERITY[issue.severity].bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
            {s.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {issue.impact > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Est. impact</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>~${issue.impact.toLocaleString()}/mo</div>
            </div>
          )}
          <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
        </div>
      </button>

      <div style={{ overflow: 'hidden', maxHeight: isOpen ? 1200 : 0, opacity: isOpen ? 1 : 0, transition: 'max-height 0.4s ease, opacity 0.3s ease' }}>
        <div style={{ padding: '0 18px 20px', borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Extra info banner */}
          {issue.extraInfo && (
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--purple-light)', fontWeight: 600 }}>
              💡 {issue.extraInfo}
            </div>
          )}

          {/* Affected products */}
          {issue.affectedProducts?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Affected products</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {issue.affectedProducts.map((p, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    📦 {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Why */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Why this matters</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{issue.why}</p>
          </div>

          {/* Fix */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Recommended fix</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{issue.fix}</p>
          </div>

          {/* Before / After */}
          {issue.beforeAfter && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Example rewrite</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', marginBottom: 6, textTransform: 'uppercase' }}>❌ Current</div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>{issue.beforeAfter.before}</p>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#10B981', marginBottom: 6, textTransform: 'uppercase' }}>✅ AI optimized</div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: issue.beforeAfter.after }} />
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <button onClick={() => navigate(issue.actionPath)}
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, background: s.color, border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Zap size={12} /> {issue.actionLabel} <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────
export default function StoreDiagnosisPage() {
  const [phase, setPhase]           = useState('scanning') // scanning | results
  const [animated, setAnimated]     = useState(false)
  const [openId, setOpenId]         = useState(null)
  const [data, setData]             = useState(null)
  const [productCount, setProductCount] = useState(0)
  const token    = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    let dataReady = false
    let timerDone = false

    const tryReveal = () => {
      if (dataReady && timerDone) {
        setPhase('results')
        setTimeout(() => setAnimated(true), 250)
      }
    }

    Promise.all([
      fetch('/api/products',  { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/dashboard', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.ok ? r.json() : {}).catch(() => ({})),
    ]).then(([prods, dash]) => {
      const prodArr = Array.isArray(prods) ? prods : []
      setProductCount(prodArr.length)
      const diagnosis = buildDiagnosis(prodArr, dash)
      setData(diagnosis)
      // Auto-open first non-good issue
      const first = diagnosis.issues.find(i => i.severity !== 'good')
      setOpenId(first?.id || diagnosis.issues[0]?.id)
      dataReady = true
      tryReveal()
    })

    const timer = setTimeout(() => { timerDone = true; tryReveal() }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const shopDomain = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}')?.shopDomain || 'your store' }
    catch { return 'your store' }
  })()

  if (phase === 'scanning' || !data) {
    return (
      <div style={{ padding: '0 0 48px' }}>
        <ScanningScreen shopDomain={shopDomain} productCount={productCount} />
      </div>
    )
  }

  const { healthScore, totalRecoverable, issues, topIssue, totalProducts, totalRevenue, convRate } = data
  const critCount = issues.filter(i => i.severity === 'critical').length
  const warnCount = issues.filter(i => i.severity === 'warning').length
  const allGood   = critCount === 0 && warnCount === 0

  return (
    <div style={{ padding: '0 0 48px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: allGood ? '#10B981' : '#EF4444', boxShadow: `0 0 6px ${allGood ? '#10B981' : '#EF4444'}` }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Store Diagnosis · {totalProducts} products scanned · Just completed
          </span>
        </div>
        <h1 className="page-title">Your Store Diagnosis</h1>
        <p className="page-sub">
          {allGood
            ? <>Your store is performing well across all {totalProducts} products. Here's the full breakdown.</>
            : <>Found <strong style={{ color: '#EF4444' }}>{critCount + warnCount} issue{critCount + warnCount > 1 ? 's' : ''}</strong> costing up to <strong style={{ color: '#10B981' }}>${totalRecoverable.toLocaleString()}/month</strong> in recoverable revenue.</>
          }
        </p>
      </div>

      {/* ── Dashboard card ── */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
          <HealthRing score={healthScore} animated={animated} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              Overall store health
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
              {[
                { label: 'Products',     value: totalProducts,                 color: 'var(--text-primary)' },
                { label: 'Total Revenue',value: `$${Math.round(totalRevenue).toLocaleString()}`, color: '#10B981' },
                { label: 'Recoverable',  value: totalRecoverable > 0 ? `~$${totalRecoverable.toLocaleString()}` : '$0', color: totalRecoverable > 0 ? '#F59E0B' : '#10B981' },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[
                { color: '#EF4444', label: `${critCount} Critical` },
                { color: '#F59E0B', label: `${warnCount} Warning` },
                { color: '#10B981', label: `${issues.filter(i => i.severity === 'good').length} Good` },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => window.location.reload()}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <RefreshCw size={11} /> Rescan
          </button>
        </div>

        {/* Clickable issue cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {issues.map(issue => (
            <IssueCard key={issue.id} issue={issue}
              active={openId === issue.id}
              onClick={() => setOpenId(openId === issue.id ? null : issue.id)} />
          ))}
        </div>
      </div>

      {/* ── Plain English summary ── */}
      {topIssue && !allGood && (
        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderLeft: '3px solid var(--purple)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            Most urgent fix
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {topIssue.id === 'descriptions' && topIssue.affectedProducts?.length > 0
              ? <>Your biggest quick win is <strong style={{ color: 'var(--text-primary)' }}>product descriptions</strong>. <strong style={{ color: 'var(--text-primary)' }}>{topIssue.affectedProducts.slice(0, 2).join(' and ')}</strong>{topIssue.affectedProducts.length > 2 ? ` and ${topIssue.affectedProducts.length - 2} others` : ''} have descriptions too thin to convert — shoppers arrive, see no reason to buy, and leave. Optivise rewrites them all in one click.</>
              : topIssue.id === 'revenue' && topIssue.affectedProducts?.length > 0
              ? <><strong style={{ color: 'var(--text-primary)' }}>{topIssue.affectedProducts.slice(0, 2).join(' and ')}</strong> have never generated a single sale. Dead products confuse buyers and lower your overall store trust. Refresh their descriptions or remove them.</>
              : <>Your conversion rate of <strong style={{ color: 'var(--text-primary)' }}>{convRate.toFixed(2)}%</strong> is below the 2.5% industry average. Small improvements to trust signals and checkout friction can meaningfully increase revenue without extra ad spend.</>
            }
          </p>
        </div>
      )}

      {allGood && (
        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderLeft: '3px solid #10B981', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            Store health
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Your store is in good shape. All products have descriptions, all are generating revenue, and your conversion rate{convRate > 0 ? ` of ${convRate.toFixed(2)}% is above the 2.5% industry average` : ' is being tracked'}. Keep running A/B tests to continuously improve.
          </p>
        </div>
      )}

      {/* ── Accordions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, paddingLeft: 2 }}>
          Full breakdown — click any issue to expand
        </div>
        {issues.map(issue => (
          <AccordionItem key={issue.id} issue={issue}
            isOpen={openId === issue.id}
            onToggle={() => setOpenId(openId === issue.id ? null : issue.id)} />
        ))}
      </div>

      {/* ── CTA ── */}
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {allGood ? 'Keep your store growing' : 'Fix all issues with AI in one click'}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {allGood
            ? 'Run A/B tests, optimise descriptions, and track revenue — all in one place.'
            : 'Optivise can rewrite your descriptions, surface abandoned carts, and improve your store automatically.'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/products')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--purple)', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
            <Zap size={14} /> {allGood ? 'Optimise Products' : 'Fix Descriptions'} <ArrowRight size={14} />
          </button>
          <button onClick={() => navigate('/insights')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            Revenue Leaks <ArrowRight size={14} />
          </button>
          <button onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}