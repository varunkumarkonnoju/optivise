import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Zap, ArrowRight, RefreshCw, TrendingDown, Package, Image } from 'lucide-react'

// ── REAL DATA CALCULATOR ──────────────────────────────
const buildDiagnosis = (prods, dash) => {
  const products      = Array.isArray(prods) ? prods : []
  const totalProducts = products.length
  const totalRevenue  = dash?.totalRevenue || 0
  const convRate      = dash?.conversionRate || 0

  // Find products with weak descriptions (< 100 chars of actual text)
  const weakDescProducts = products.filter(p => {
    const text = (p.description || '').replace(/<[^>]*>/g, '').trim()
    return text.length < 100
  })

  // Find zero revenue products
  const zeroRevProducts = products.filter(p => !p.revenue || p.revenue === 0)

  // Find products with no images
  const noImageProducts = products.filter(p => !p.imageUrl)

  // Build before/after using real product name
  const firstWeakProd = weakDescProducts[0]
  const beforeAfter = firstWeakProd ? {
    before: firstWeakProd.description
      ? firstWeakProd.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
      : `${firstWeakProd.title}. Available now. Order today.`,
    after: `<strong>${firstWeakProd.title} — built for people who want the best.</strong> Premium quality, designed to last. Every detail considered. Free shipping on orders over $50. 30-day returns, no questions asked.`,
  } : null

  // Health score
  const descScore    = totalProducts > 0 ? (weakDescProducts.length / totalProducts) : 0
  const convScore    = convRate < 2.5 ? (convRate / 2.5) : 1
  const imageScore   = totalProducts > 0 ? (noImageProducts.length / totalProducts) : 0
  const healthScore  = Math.round(Math.max(15, Math.min(90,
    100 - (descScore * 30) - ((1 - convScore) * 25) - (imageScore * 15)
  )))

  const issues = [
    {
      id: 'descriptions',
      icon: '📝',
      title: 'Weak Product Descriptions',
      severity: weakDescProducts.length > totalProducts * 0.4 ? 'critical' : weakDescProducts.length > 0 ? 'warning' : 'good',
      stat: weakDescProducts.length > 0 ? `${weakDescProducts.length} of ${totalProducts} products` : `All ${totalProducts} products`,
      statDetail: weakDescProducts.length > 0 ? 'have thin or missing copy' : 'have strong descriptions ✅',
      impact: weakDescProducts.length * 180,
      affectedProducts: weakDescProducts.slice(0, 4).map(p => p.title),
      why: weakDescProducts.length > 0
        ? `${weakDescProducts.length} of your products have descriptions under 100 characters — well below the threshold that search engines and buyers expect. Visitors land on these pages, see no compelling reason to buy, and leave. Products include: ${weakDescProducts.slice(0, 3).map(p => p.title).join(', ')}.`
        : 'All your products have solid descriptions. Keep them updated as you add new products.',
      fix: 'Rewrite each affected description to at least 150 words. Lead with the customer\'s problem, follow with specific benefits, and close with a reason to buy today. Click Fix Descriptions to generate AI rewrites for all affected products in one click.',
      actionLabel: 'Fix with AI',
      actionPath: '/products',
      beforeAfter,
    },
    {
      id: 'revenue',
      icon: '💀',
      title: 'Dead Products — Zero Revenue',
      severity: zeroRevProducts.length > totalProducts * 0.5 ? 'critical' : zeroRevProducts.length > 0 ? 'warning' : 'good',
      stat: zeroRevProducts.length > 0 ? `${zeroRevProducts.length} of ${totalProducts} products` : 'All products selling',
      statDetail: zeroRevProducts.length > 0 ? 'have generated zero revenue' : 'have generated revenue ✅',
      impact: zeroRevProducts.length * 120,
      affectedProducts: zeroRevProducts.slice(0, 4).map(p => p.title),
      why: zeroRevProducts.length > 0
        ? `${zeroRevProducts.length} products — ${zeroRevProducts.slice(0, 3).map(p => p.title).join(', ')} — have never sold. Dead products confuse visitors, dilute your store's focus, and hurt your overall conversion rate. Every page a visitor sees that doesn't convert lowers their trust in your store.`
        : 'Every product in your store has generated revenue. Great inventory management.',
      fix: 'For each zero-revenue product: first improve the description and images. If still no sales after 30 days, consider removing or repricing. Use A/B testing to find the right price point for slow movers.',
      actionLabel: 'Review Products',
      actionPath: '/products',
      beforeAfter: null,
    },
    {
      id: 'conversion',
      icon: '📉',
      title: 'Conversion Rate Below Average',
      severity: convRate > 0 && convRate < 1.5 ? 'critical' : convRate >= 1.5 && convRate < 2.5 ? 'warning' : 'good',
      stat: convRate > 0 ? `${convRate.toFixed(2)}% conversion` : 'No data yet',
      statDetail: convRate > 0 ? 'industry average is 2.5%' : 'connect store to measure',
      impact: convRate > 0 && totalRevenue > 0 ? Math.round(totalRevenue * 0.35) : 0,
      affectedProducts: [],
      why: convRate > 0
        ? `For every 100 visitors, only ${convRate.toFixed(1)} buy. If you hit the 2.5% industry average you'd make ${Math.round(Math.max(0, (2.5 - convRate) / Math.max(convRate, 0.1)) * 100)}% more revenue without spending a single extra dollar on ads. Your current revenue of $${totalRevenue.toLocaleString()} could be $${Math.round(totalRevenue * (2.5 / Math.max(convRate, 0.1))).toLocaleString()}.`
        : 'Connect your Shopify store and start getting orders to measure conversion rate.',
      fix: 'Add trust badges (secure checkout, free returns, money-back guarantee) near your Add to Cart button. Display shipping cost on the product page — surprise charges at checkout are the #1 abandonment trigger. Run A/B tests on your top products.',
      actionLabel: 'Run A/B Tests',
      actionPath: '/abtesting',
      beforeAfter: null,
    },
  ]

  // Sort by impact descending
  issues.sort((a, b) => b.impact - a.impact)

  const totalRecoverable = issues.reduce((sum, i) => sum + i.impact, 0)
  const topIssue = issues.find(i => i.severity === 'critical') || issues[0]

  return { healthScore, totalRecoverable, issues, topIssue, totalProducts, totalRevenue }
}

const SEVERITY = {
  critical: { label: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', bar: '#EF4444' },
  warning:  { label: 'Warning',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  bar: '#F59E0B' },
  good:     { label: 'Good',     color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', bar: '#10B981' },
}

// ── HEALTH RING ───────────────────────────────────────
function HealthRing({ score, animated }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = animated ? circ * (1 - score / 100) : circ
  const color = score >= 70 ? '#10B981' : score >= 45 ? '#F59E0B' : '#EF4444'
  const label = score >= 70 ? 'Good' : score >= 45 ? 'Needs Work' : 'Critical'
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
function ScanningScreen({ shopDomain, products }) {
  const [step, setStep] = useState(0)
  const steps = [
    { label: 'Connecting to your Shopify store...', icon: '🔗' },
    { label: `Found ${products} products to analyse...`, icon: '📦' },
    { label: 'Scanning product descriptions...', icon: '📝' },
    { label: 'Analysing revenue data...', icon: '💰' },
    { label: 'Checking conversion metrics...', icon: '📊' },
    { label: 'Generating your diagnosis...', icon: '🧠' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => s < steps.length - 1 ? s + 1 : s)
    }, 520)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Diagnosing your store
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{shopDomain}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: i <= step ? 1 : 0.25, transition: 'opacity 0.4s ease' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: i < step ? 'rgba(16,185,129,0.15)' : i === step ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)',
              border: `1px solid ${i < step ? '#10B98140' : i === step ? 'var(--purple)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
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
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>This takes about 3 seconds...</div>
    </div>
  )
}

// ── ISSUE CARD ────────────────────────────────────────
function IssueCard({ issue, onClick, active }) {
  const s = SEVERITY[issue.severity]
  const barWidth = issue.severity === 'critical' ? '85%' : issue.severity === 'warning' ? '52%' : '15%'
  return (
    <div onClick={onClick} style={{
      background: active ? s.bg : 'var(--bg-secondary)',
      border: `1px solid ${active ? s.border : 'var(--border)'}`,
      borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
      cursor: 'pointer', transition: 'all 0.2s ease',
      boxShadow: active ? `0 0 0 1px ${s.color}30` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 20 }}>{issue.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 800, color: s.color, background: `${s.bar}18`, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {s.label}
        </span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{issue.title}</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>{issue.stat}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{issue.statDetail}</div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: barWidth, background: s.bar, borderRadius: 2 }} />
      </div>
      {issue.impact > 0 && (
        <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>~${issue.impact.toLocaleString()}/mo lost</div>
      )}
    </div>
  )
}

// ── ACCORDION ─────────────────────────────────────────
function AccordionItem({ issue, isOpen, onToggle }) {
  const s = SEVERITY[issue.severity]
  const navigate = useNavigate()
  return (
    <div style={{ border: `1px solid ${s.color}20`, borderLeft: `4px solid ${s.color}`, borderRadius: '0 12px 12px 0', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 18 }}>{issue.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{issue.title}</span>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
            {s.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {issue.impact > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Est. loss</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: s.color }}>~${issue.impact.toLocaleString()}/mo</div>
            </div>
          )}
          <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
        </div>
      </button>

      <div style={{ overflow: 'hidden', maxHeight: isOpen ? 1000 : 0, opacity: isOpen ? 1 : 0, transition: 'max-height 0.4s ease, opacity 0.25s ease' }}>
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>

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
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Why this hurts conversions</div>
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
          <button onClick={() => navigate(issue.actionPath)} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, background: s.color, border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer' }}
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
  const [scanning, setScanning]   = useState(true)
  const [animated, setAnimated]   = useState(false)
  const [openId, setOpenId]       = useState(null)
  const [data, setData]           = useState(null)
  const [productCount, setProductCount] = useState(0)
  const token    = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    let dataReady = false
    let timerDone = false

    const tryReveal = () => {
      if (dataReady && timerDone) {
        setScanning(false)
        setTimeout(() => {
          setAnimated(true)
        }, 200)
      }
    }

    // Fetch real data
    Promise.all([
      fetch('/api/products',  { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => []),
      fetch('/api/dashboard', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => ({})),
    ]).then(([prods, dash]) => {
      const prodArr = Array.isArray(prods) ? prods : []
      setProductCount(prodArr.length)
      const diagnosis = buildDiagnosis(prodArr, dash)
      setData(diagnosis)
      // Auto open first critical issue
      const firstCritical = diagnosis.issues.find(i => i.severity === 'critical')
      setOpenId(firstCritical?.id || diagnosis.issues[0]?.id)
      dataReady = true
      tryReveal()
    })

    // Minimum scan time — feels real
    const timer = setTimeout(() => {
      timerDone = true
      tryReveal()
    }, 3200)

    return () => clearTimeout(timer)
  }, [])

  const shopDomain = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')?.shopDomain || 'your store'
    } catch { return 'your store' }
  })()

  if (scanning || !data) {
    return (
      <div style={{ padding: '0 0 48px' }}>
        <ScanningScreen shopDomain={shopDomain} products={productCount} />
      </div>
    )
  }

  const { healthScore, totalRecoverable, issues, topIssue, totalProducts, totalRevenue } = data
  const criticalCount = issues.filter(i => i.severity === 'critical').length

  return (
    <div style={{ padding: '0 0 48px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px #EF4444' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Store Diagnosis · {totalProducts} products scanned · Just completed
          </span>
        </div>
        <h1 className="page-title">Your Store Diagnosis</h1>
        <p className="page-sub">
          {criticalCount > 0
            ? <>Found <strong style={{ color: '#EF4444' }}>{criticalCount} critical issue{criticalCount > 1 ? 's' : ''}</strong> costing your store up to <strong style={{ color: '#10B981' }}>${totalRecoverable.toLocaleString()}/month</strong>.</>
            : <>Your store is in good shape! Here's what we found across {totalProducts} products.</>
          }
        </p>
      </div>

      {/* ── Dashboard card ── */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
          <HealthRing score={healthScore} animated={animated} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Overall store health
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
              {[
                { label: 'Products', value: totalProducts, color: 'var(--text-primary)' },
                { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, color: '#10B981' },
                { label: 'Recoverable', value: `~$${totalRecoverable.toLocaleString()}`, color: '#EF4444' },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[
                { color: '#EF4444', label: `${issues.filter(i => i.severity === 'critical').length} Critical` },
                { color: '#F59E0B', label: `${issues.filter(i => i.severity === 'warning').length} Warning` },
                { color: '#10B981', label: `${issues.filter(i => i.severity === 'good').length} Good` },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { setScanning(true); setAnimated(false); setTimeout(() => window.location.reload(), 100) }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <RefreshCw size={11} /> Rescan
          </button>
        </div>

        {/* 3 clickable issue cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {issues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              active={openId === issue.id}
              onClick={() => setOpenId(openId === issue.id ? null : issue.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Top issue plain English summary ── */}
      {topIssue && (
        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderLeft: '3px solid var(--purple)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            Most urgent fix
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {topIssue.id === 'descriptions' && topIssue.affectedProducts?.length > 0
              ? <>Your biggest opportunity is <strong style={{ color: 'var(--text-primary)' }}>product descriptions</strong>. Products like <strong style={{ color: 'var(--text-primary)' }}>{topIssue.affectedProducts[0]}</strong>{topIssue.affectedProducts[1] ? <> and <strong style={{ color: 'var(--text-primary)' }}>{topIssue.affectedProducts[1]}</strong></> : ''} have descriptions so thin that shoppers have no reason to buy. This is the fastest fix with the highest revenue impact.</>
              : topIssue.id === 'revenue'
              ? <>You have <strong style={{ color: 'var(--text-primary)' }}>{topIssue.affectedProducts?.length} products</strong> that have never sold a single unit. These dead products confuse visitors and lower your store's trust. Improving their descriptions or removing them will immediately improve your conversion rate.</>
              : <>Your conversion rate of <strong style={{ color: 'var(--text-primary)' }}>{data?.issues?.find(i => i.id === 'conversion')?.stat}</strong> is below the industry average. Small changes to your product pages — trust badges, better descriptions, upfront shipping costs — can significantly improve this number.</>
            }
          </p>
        </div>
      )}

      {/* ── Accordions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, paddingLeft: 2 }}>
          Issues — click to expand
        </div>
        {issues.map(issue => (
          <AccordionItem
            key={issue.id}
            issue={issue}
            isOpen={openId === issue.id}
            onToggle={() => setOpenId(openId === issue.id ? null : issue.id)}
          />
        ))}
      </div>

      {/* ── CTA ── */}
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          Fix all issues with AI in one click
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Optivise can rewrite your descriptions, find abandoned carts, and improve your store automatically.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/products')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--purple)', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
            <Zap size={14} /> Fix Descriptions <ArrowRight size={14} />
          </button>
          <button onClick={() => navigate('/insights')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            Full Revenue Report <ArrowRight size={14} />
          </button>
          <button onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            Go to Dashboard
          </button>
        </div>
      </div>

    </div>
  )
}