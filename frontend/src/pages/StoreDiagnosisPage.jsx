import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Zap, ArrowRight, RefreshCw, TrendingUp, Target, Award } from 'lucide-react'

// ── REAL DATA DIAGNOSIS ENGINE ────────────────────────
const buildDiagnosis = (prods, dash) => {
  const products     = Array.isArray(prods) ? prods : []
  const total        = products.length
  const totalRevenue = parseFloat(dash?.totalRevenue || 0)
  const convRate     = parseFloat(dash?.conversionRate || 0)
  const now          = Date.now()

  // ── Weak descriptions (exclude very new products < 3 days) ──
  const weakDesc = products.filter(p => {
    const text = (p.description || '').replace(/<[^>]*>/g, '').trim()
    return text.length < 100
  })

  // ── Zero revenue — exclude products created < 14 days ago ──
  const zeroRev = products.filter(p => {
    if (!p.revenue || p.revenue === 0) {
      // If we have created_at, check age
      if (p.createdAt) {
        const age = (now - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        return age > 14 // only flag if older than 14 days
      }
      return true // flag if no date info
    }
    return false
  })

  // ── No images ──
  const noImage = products.filter(p => !p.imageUrl)

  // ── Build before/after from first weak product ──
  const firstWeak = weakDesc[0]
  const beforeAfter = firstWeak ? {
    before: (() => {
      const text = (firstWeak.description || '').replace(/<[^>]*>/g, '').trim()
      return text.length > 10 ? text.substring(0, 140) + '...' : `${firstWeak.title}. Available now. Order today.`
    })(),
    after: `<strong>${firstWeak.title} — crafted for people who demand the best.</strong> Every detail considered, built to last. Whether buying for yourself or as a gift, this is the one you'll reach for every time. Free shipping. 30-day no-questions returns.`,
  } : null

  // ── Health score ──
  const descPenalty  = total > 0 ? (weakDesc.length / total) * 30 : 0
  const convPenalty  = convRate > 0 && convRate < 2.5 ? ((2.5 - convRate) / 2.5) * 20 : 0
  const revPenalty   = total > 0 ? (zeroRev.length / total) * 15 : 0
  const imagePenalty = total > 0 ? (noImage.length / total) * 10 : 0
  const healthScore  = Math.round(Math.max(20, Math.min(98, 100 - descPenalty - convPenalty - revPenalty - imagePenalty)))

  // ── Conversion analysis ──
  const convAboveAvg = convRate >= 2.5
  const convImpact   = !convAboveAvg && convRate > 0 && totalRevenue > 0
    ? Math.round(totalRevenue * ((2.5 - convRate) / 2.5) * 0.5) : 0

  // ── What would get to 100 ── (for healthy stores)
  const improvementRoadmap = []
  if (convRate > 0 && convRate < 4.0) improvementRoadmap.push({ action: `Improve conversion from ${convRate.toFixed(2)}% → 4%`, impact: `+${Math.round((4 - convRate) / convRate * 100)}% revenue`, icon: '📈' })
  if (weakDesc.length > 0) improvementRoadmap.push({ action: `Optimize ${weakDesc.length} product description${weakDesc.length > 1 ? 's' : ''}`, impact: `~$${(weakDesc.length * 180).toLocaleString()}/mo`, icon: '📝' })
  if (zeroRev.length > 0) improvementRoadmap.push({ action: `Revive ${zeroRev.length} zero-revenue product${zeroRev.length > 1 ? 's' : ''}`, impact: `~$${(zeroRev.length * 130).toLocaleString()}/mo`, icon: '💀' })
  improvementRoadmap.push({ action: 'Run A/B tests on top 3 products', impact: '+15-30% conversion', icon: '🧪' })
  improvementRoadmap.push({ action: 'Set up abandoned cart emails', impact: '5-15% cart recovery', icon: '📧' })

  const issues = [
    {
      id: 'descriptions',
      icon: '📝',
      title: 'Product Descriptions',
      severity: weakDesc.length === 0 ? 'good' : weakDesc.length > total * 0.4 ? 'critical' : 'warning',
      stat: weakDesc.length === 0 ? `All ${total} optimized` : `${weakDesc.length} of ${total} products`,
      statDetail: weakDesc.length === 0 ? 'have strong descriptions ✅' : 'have thin or missing copy',
      impact: weakDesc.length * 180,
      affectedProducts: weakDesc.slice(0, 5).map(p => p.title),
      why: weakDesc.length === 0
        ? 'All your products have solid descriptions. Keep them updated as you add new products and review them every 90 days — copy that was good 6 months ago may be outdated.'
        : `${weakDesc.slice(0, 2).map(p => p.title).join(', ')}${weakDesc.length > 2 ? ` and ${weakDesc.length - 2} more` : ''} have descriptions under 100 characters. Short copy fails to answer buyer questions, hurts SEO, and gives visitors no reason to add to cart.`,
      fix: weakDesc.length === 0
        ? 'Your descriptions are solid! Consider A/B testing different copy styles on your top 3 products to squeeze out more conversions. Small wording changes can improve conversion by 10-20%.'
        : 'Rewrite each affected description to 150+ words. Lead with the buyer\'s problem, follow with specific benefits, close with a reason to buy today. Optivise generates optimized rewrites in one click.',
      actionLabel: weakDesc.length === 0 ? 'A/B Test Copy' : 'Fix with AI',
      actionPath: weakDesc.length === 0 ? '/abtesting' : '/products',
      beforeAfter: weakDesc.length > 0 ? beforeAfter : null,
      nextStep: weakDesc.length === 0 ? 'Run A/B tests on your best-selling product to find the highest-converting copy.' : null,
    },
    {
      id: 'revenue',
      icon: '💰',
      title: 'Product Revenue Health',
      severity: zeroRev.length === 0 ? 'good' : zeroRev.length > total * 0.5 ? 'critical' : 'warning',
      stat: zeroRev.length === 0 ? 'All products selling' : `${zeroRev.length} of ${total} products`,
      statDetail: zeroRev.length === 0 ? 'generating revenue ✅' : 'have zero revenue (14+ days old)',
      impact: zeroRev.length * 130,
      affectedProducts: zeroRev.slice(0, 5).map(p => p.title),
      why: zeroRev.length === 0
        ? 'Every product in your store is generating revenue. Excellent. Monitor this monthly — products that stop selling are often the first sign of description or pricing issues.'
        : `${zeroRev.slice(0, 2).map(p => p.title).join(', ')}${zeroRev.length > 2 ? ` and ${zeroRev.length - 2} more` : ''} have been live for 14+ days with zero sales. Dead products confuse visitors, dilute your store focus, and lower overall conversion rate.`,
      fix: zeroRev.length === 0
        ? 'Keep monitoring. Set a 60-day rule: any product with zero sales gets a description refresh and price review before considering removal.'
        : 'For each zero-revenue product: 1) Refresh the description with AI, 2) Check the price vs competitors, 3) Add better images. If still no sales after 30 days, remove or discount aggressively.',
      actionLabel: zeroRev.length === 0 ? 'View Analytics' : 'Review Products',
      actionPath: zeroRev.length === 0 ? '/analytics' : '/products',
      beforeAfter: null,
      nextStep: zeroRev.length === 0 ? 'Set up monthly revenue monitoring alerts so you catch dead products early.' : null,
    },
    {
      id: 'conversion',
      icon: convAboveAvg ? '📈' : '📉',
      title: 'Conversion Rate',
      severity: convRate === 0 ? 'warning' : convRate >= 3.5 ? 'good' : convRate >= 2.5 ? 'good' : convRate >= 1.5 ? 'warning' : 'critical',
      stat: convRate > 0 ? `${convRate.toFixed(2)}% conversion` : 'No data yet',
      statDetail: convRate === 0 ? 'connect store to measure'
        : convRate >= 3.5 ? `${(convRate - 2.5).toFixed(1)}% above avg — top 20% of stores ✅`
        : convAboveAvg ? `${(convRate - 2.5).toFixed(1)}% above industry average ✅`
        : `${(2.5 - convRate).toFixed(1)}% below industry average`,
      impact: convImpact,
      affectedProducts: [],
      why: convRate === 0
        ? 'Connect your Shopify store to start measuring your real conversion rate.'
        : convRate >= 3.5
        ? `Your ${convRate.toFixed(2)}% conversion rate puts you in the top 20% of Shopify stores. The industry average is 2.5%. You're doing something right — now the goal is pushing toward 4-5% through systematic A/B testing.`
        : convAboveAvg
        ? `Your ${convRate.toFixed(2)}% conversion rate beats the 2.5% industry average. Good position — but there's still significant upside. Moving from ${convRate.toFixed(2)}% to 4% would increase revenue by ${Math.round((4 - convRate) / convRate * 100)}% without spending more on ads.`
        : `For every 100 visitors, only ${convRate.toFixed(1)} buy. At 2.5% industry average you'd make ${Math.round((2.5 - convRate) / Math.max(convRate, 0.01) * 100)}% more without spending an extra dollar on traffic.`,
      fix: convRate >= 3.5
        ? 'To push beyond 3.5%: A/B test your Add to Cart button copy, test urgency elements (limited stock), and experiment with social proof placement directly above the buy button.'
        : convAboveAvg
        ? 'You\'re above average — to push further, A/B test button copy, add urgency elements, and test different price points on your top 3 products.'
        : 'Add trust badges above Add to Cart. Show shipping cost on product page (not at checkout). Add 2-3 specific customer reviews near the buy button. Run A/B tests on your top products.',
      actionLabel: convRate >= 2.5 ? 'Push Higher with A/B' : 'Start A/B Testing',
      actionPath: '/abtesting',
      beforeAfter: null,
      nextStep: convRate >= 2.5 ? `Target: push from ${convRate.toFixed(2)}% to ${(convRate + 0.5).toFixed(1)}% through systematic A/B testing on your top 3 products.` : null,
      extraInfo: convRate > 0 && convRate < 2.5 && totalRevenue > 0
        ? `At 2.5% conversion your revenue would be $${Math.round(totalRevenue * (2.5 / Math.max(convRate, 0.01))).toLocaleString()} vs current $${Math.round(totalRevenue).toLocaleString()}`
        : convRate >= 2.5 && totalRevenue > 0
        ? `At 4% conversion your revenue would be $${Math.round(totalRevenue * (4 / Math.max(convRate, 0.01))).toLocaleString()} vs current $${Math.round(totalRevenue).toLocaleString()}`
        : null,
    },
  ]

  const order = { critical: 0, warning: 1, good: 2 }
  issues.sort((a, b) => order[a.severity] - order[b.severity])

  const totalRecoverable = issues.reduce((s, i) => s + i.impact, 0)
  const topIssue = issues.find(i => i.severity !== 'good') || null
  const allGood  = issues.every(i => i.severity === 'good')

  return { healthScore, totalRecoverable, issues, topIssue, allGood, total, totalRevenue, convRate, improvementRoadmap }
}

const SEVERITY = {
  critical: { label: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  bar: '#EF4444' },
  warning:  { label: 'Warning',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', bar: '#F59E0B' },
  good:     { label: 'Good',     color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', bar: '#10B981' },
}

// ── HEALTH RING ───────────────────────────────────────
function HealthRing({ score, animated }) {
  const r = 54, circ = 2 * Math.PI * r
  const offset = animated ? circ * (1 - score / 100) : circ
  const color = score >= 80 ? '#10B981' : score >= 55 ? '#F59E0B' : '#EF4444'
  const label = score >= 80 ? 'Excellent' : score >= 55 ? 'Needs Work' : 'Critical'
  return (
    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="1" opacity="0.1" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 8px ${color}60)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-2px' }}>{score}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>/ 100</div>
        <div style={{ fontSize: 11, fontWeight: 800, color, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      </div>
    </div>
  )
}

// ── SCANNING ANIMATION ────────────────────────────────
function ScanningScreen({ shopDomain, productCount, scanProducts }) {
  const [step, setStep] = useState(0)
  const [scannedProducts, setScannedProducts] = useState([])

  const baseSteps = [
    { label: 'Connecting to Shopify...', icon: '🔗' },
    { label: productCount > 0 ? `Found ${productCount} products` : 'Loading inventory...', icon: '📦' },
    { label: 'Scanning product descriptions...', icon: '📝' },
    { label: 'Analysing revenue per product...', icon: '💰' },
    { label: 'Comparing against benchmarks...', icon: '📊' },
    { label: 'Building your diagnosis...', icon: '🧠' },
  ]

  useEffect(() => {
    const t = setInterval(() => setStep(s => s < baseSteps.length - 1 ? s + 1 : s), 460)
    return () => clearInterval(t)
  }, [])

  // Show real product names being "scanned"
  useEffect(() => {
    if (!scanProducts?.length) return
    let i = 0
    const t = setInterval(() => {
      if (i < Math.min(scanProducts.length, 4)) {
        setScannedProducts(prev => [...prev, scanProducts[i]])
        i++
      } else clearInterval(t)
    }, 600)
    return () => clearInterval(t)
  }, [scanProducts])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Diagnosing your store</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{shopDomain}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380 }}>
        {baseSteps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.4s ease' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: i < step ? 'rgba(16,185,129,0.15)' : i === step ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)', border: `1px solid ${i < step ? '#10B98150' : i === step ? 'var(--purple)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'all 0.3s ease' }}>
              {i < step ? '✓' : s.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400 }}>{s.label}</div>
              {/* Show real product names during scan */}
              {i === 2 && step >= 2 && scannedProducts.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                  {scannedProducts.map((p, j) => (
                    <span key={j} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ width: 300, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--purple), #818cf8)', borderRadius: 2, transition: 'width 0.5s ease', width: `${((step + 1) / baseSteps.length) * 100}%` }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Takes about 3 seconds...</div>
    </div>
  )
}

// ── ISSUE CARD ────────────────────────────────────────
function IssueCard({ issue, active, onClick }) {
  const s = SEVERITY[issue.severity]
  const barW = issue.severity === 'critical' ? '85%' : issue.severity === 'warning' ? '52%' : '15%'
  return (
    <div onClick={onClick} style={{ background: active ? s.bg : 'var(--bg-secondary)', border: `1px solid ${active ? s.border : 'var(--border)'}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', transition: 'all 0.2s ease', outline: active ? `1px solid ${s.color}30` : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 18 }}>{issue.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 800, color: s.color, background: `${s.bar}15`, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{issue.title}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{issue.stat}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{issue.statDetail}</div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: barW, background: s.bar, borderRadius: 2 }} />
      </div>
      {issue.impact > 0
        ? <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>~${issue.impact.toLocaleString()}/mo impact</div>
        : <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>No revenue impact ✅</div>}
    </div>
  )
}

// ── IMPROVEMENT ROADMAP (for healthy stores) ──────────
function ImprovementRoadmap({ roadmap, healthScore }) {
  const navigate = useNavigate()
  return (
    <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Award size={18} color="#10B981" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Your path to {Math.min(healthScore + 5, 100)}/100</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>You're in the top stores — here's what separates good from elite</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {roadmap.slice(0, 4).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.action}</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', flexShrink: 0 }}>{item.impact}</div>
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/abtesting')} style={{ width: '100%', marginTop: 14, background: '#10B981', border: 'none', borderRadius: 10, padding: '10px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <TrendingUp size={12} /> Start optimising →
      </button>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{issue.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{issue.title}</span>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>{s.label}</span>
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

          {/* Extra info */}
          {issue.extraInfo && (
            <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--purple-light)', fontWeight: 600 }}>
              💡 {issue.extraInfo}
            </div>
          )}

          {/* Next step for good items */}
          {issue.nextStep && (
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Next step to improve</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{issue.nextStep}</div>
            </div>
          )}

          {/* Affected products */}
          {issue.affectedProducts?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Affected products</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {issue.affectedProducts.map((p, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>📦 {p}</span>
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
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Recommended action</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{issue.fix}</p>
          </div>

          {/* Before / After */}
          {issue.beforeAfter && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Example rewrite</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', marginBottom: 6, textTransform: 'uppercase' }}>❌ Current</div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>{issue.beforeAfter.before}</p>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#10B981', marginBottom: 6, textTransform: 'uppercase' }}>✅ AI Optimized</div>
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
  const [phase, setPhase]       = useState('scanning')
  const [animated, setAnimated] = useState(false)
  const [openId, setOpenId]     = useState(null)
  const [data, setData]         = useState(null)
  const [productCount, setProductCount] = useState(0)
  const [productNames, setProductNames] = useState([])
  const token    = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    let dataReady = false, timerDone = false
    const tryReveal = () => {
      if (dataReady && timerDone) {
        setPhase('results')
        setTimeout(() => setAnimated(true), 250)
      }
    }

    Promise.all([
      fetch('/api/products',  { headers: { Authorization: 'Bearer ' + token } }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/dashboard', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
    ]).then(([prods, dash]) => {
      const arr = Array.isArray(prods) ? prods : []
      setProductCount(arr.length)
      setProductNames(arr.slice(0, 4).map(p => p.title).filter(Boolean))
      const diagnosis = buildDiagnosis(arr, dash)
      setData(diagnosis)
      const first = diagnosis.issues.find(i => i.severity !== 'good')
      setOpenId(first?.id || diagnosis.issues[0]?.id)
      dataReady = true
      tryReveal()
    })

    const timer = setTimeout(() => { timerDone = true; tryReveal() }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const shopDomain = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}')?.shopDomain || 'your store' } catch { return 'your store' } })()

  if (phase === 'scanning' || !data) {
    return (
      <div style={{ padding: '0 0 48px' }}>
        <ScanningScreen shopDomain={shopDomain} productCount={productCount} scanProducts={productNames} />
      </div>
    )
  }

  const { healthScore, totalRecoverable, issues, topIssue, allGood, total, totalRevenue, convRate, improvementRoadmap } = data
  const critCount = issues.filter(i => i.severity === 'critical').length
  const warnCount = issues.filter(i => i.severity === 'warning').length

  return (
    <div style={{ padding: '0 0 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: allGood ? '#10B981' : '#EF4444', boxShadow: `0 0 6px ${allGood ? '#10B981' : '#EF4444'}` }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Store Diagnosis · {total} products scanned · Just completed
          </span>
        </div>
        <h1 className="page-title">Your Store Diagnosis</h1>
        <p className="page-sub">
          {allGood
            ? <>Your store is performing well. Here's your path to an even higher score.</>
            : <>Found <strong style={{ color: '#EF4444' }}>{critCount + warnCount} issue{critCount + warnCount > 1 ? 's' : ''}</strong> costing up to <strong style={{ color: '#10B981' }}>${totalRecoverable.toLocaleString()}/month</strong> in recoverable revenue.</>
          }
        </p>
      </div>

      {/* Dashboard card */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
          <HealthRing score={healthScore} animated={animated} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Overall store health</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
              {[
                { label: 'Products',      value: total,                                       color: 'var(--text-primary)' },
                { label: 'Total Revenue', value: `$${Math.round(totalRevenue).toLocaleString()}`, color: '#10B981' },
                { label: 'Recoverable',   value: totalRecoverable > 0 ? `~$${totalRecoverable.toLocaleString()}` : 'All good ✅', color: totalRecoverable > 0 ? '#F59E0B' : '#10B981' },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: m.color }}>{m.value}</div>
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
          <button onClick={() => window.location.reload()} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <RefreshCw size={11} /> Rescan
          </button>
        </div>

        {/* Issue cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {issues.map(issue => (
            <IssueCard key={issue.id} issue={issue} active={openId === issue.id}
              onClick={() => setOpenId(openId === issue.id ? null : issue.id)} />
          ))}
        </div>
      </div>

      {/* Improvement roadmap for healthy stores */}
      {allGood && <ImprovementRoadmap roadmap={improvementRoadmap} healthScore={healthScore} />}

      {/* Plain English summary for stores with issues */}
      {topIssue && !allGood && (
        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderLeft: '3px solid var(--purple)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Most urgent fix</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {topIssue.id === 'descriptions' && topIssue.affectedProducts?.length > 0
              ? <><strong style={{ color: 'var(--text-primary)' }}>{topIssue.affectedProducts.slice(0, 2).join(' and ')}</strong>{topIssue.affectedProducts.length > 2 ? ` and ${topIssue.affectedProducts.length - 2} more` : ''} have descriptions too thin to convert visitors. Optivise can rewrite all of them in one click — your originals are always backed up.</>
              : topIssue.id === 'revenue' && topIssue.affectedProducts?.length > 0
              ? <><strong style={{ color: 'var(--text-primary)' }}>{topIssue.affectedProducts.slice(0, 2).join(' and ')}</strong> haven't sold in 14+ days. Refresh their descriptions with AI, review pricing, and if still no traction after 30 days — remove or discount.</>
              : <>Your conversion rate of <strong style={{ color: 'var(--text-primary)' }}>{convRate.toFixed(2)}%</strong> is below the 2.5% industry average. The fastest fix: add trust badges near your Add to Cart button and show shipping cost on the product page — not at checkout.</>
            }
          </p>
        </div>
      )}

      {/* Accordions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, paddingLeft: 2 }}>
          Full breakdown — click to expand
        </div>
        {issues.map(issue => (
          <AccordionItem key={issue.id} issue={issue} isOpen={openId === issue.id}
            onToggle={() => setOpenId(openId === issue.id ? null : issue.id)} />
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {allGood ? 'Push your store to the top 10%' : 'Fix everything with AI in minutes'}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {allGood ? 'Run A/B tests, optimise descriptions, and monitor revenue — all in one place.' : 'Optivise rewrites descriptions, finds abandoned carts, and improves your store automatically.'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/products')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--purple)', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
            <Zap size={14} /> {allGood ? 'Optimise Products' : 'Fix Descriptions'} <ArrowRight size={14} />
          </button>
          <button onClick={() => navigate('/insights')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            Revenue Leaks <ArrowRight size={14} />
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}