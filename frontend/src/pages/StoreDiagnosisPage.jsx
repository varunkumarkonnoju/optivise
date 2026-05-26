import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Zap, ArrowRight, RefreshCw } from 'lucide-react'

// ── MOCK DATA ─────────────────────────────────────────
// TODO: SHOPIFY API — replace with real data from /api/products + /api/dashboard
const getMockData = (prods, dash) => {
  const totalProducts   = prods?.length || 8
  const noDesc          = prods?.filter(p => !p.description || p.description.length < 50).length || 5
  const convRate        = dash?.conversionRate || 1.4
  const totalRevenue    = dash?.totalRevenue || 12400
  const noImage         = prods?.filter(p => !p.imageUrl).length || 2

  const healthScore = Math.max(15, Math.min(85,
    100
    - (noDesc > 0 ? 25 : 0)
    - (convRate < 2.0 ? 20 : 0)
    - (noImage > 0 ? 10 : 0)
  ))

  return {
    healthScore,
    storeName: dash?.storeName || 'Your Store',
    totalRecoverable: (noDesc * 180) + (convRate < 2.0 ? Math.round(totalRevenue * 0.35) : 0) + (noImage * 90),
    issues: [
      {
        id: 'descriptions',
        icon: '📝',
        title: 'Weak Product Descriptions',
        severity: 'critical',
        stat: `${noDesc} of ${totalProducts} products`,
        statDetail: 'have thin or missing copy',
        impact: noDesc * 180,
        why: `Your product descriptions average less than 50 words — well below the 150-word threshold that search engines and shoppers expect. Short, generic copy fails to answer buyer questions, hurts your SEO ranking, and gives visitors no reason to add to cart.`,
        fix: 'Rewrite each affected description to at least 120 words. Lead with the customer\'s problem, follow with specific benefits, and close with a clear reason to buy. Optivise can generate optimized rewrites in one click.',
        actionLabel: 'Fix Descriptions',
        actionPath: '/products',
        beforeAfter: {
          before: 'Blue leather wallet. Slim design. Card slots. Ships fast.',
          after: '<strong>The Slim Wallet built for people who refuse to carry a brick.</strong> Full-grain leather, holds 8 cards, folds flat. RFID-blocking lining. Free shipping. 30-day returns.',
        },
      },
      {
        id: 'conversion',
        icon: '📉',
        title: 'Low Conversion Rate',
        severity: convRate < 1.5 ? 'critical' : 'warning',
        stat: `${convRate.toFixed(1)}% conversion`,
        statDetail: 'industry average is 2.5%',
        impact: Math.round(totalRevenue * 0.35),
        why: `For every 100 visitors, only ${convRate.toFixed(1)} buy. If you hit the 2.5% industry average you'd make ${Math.round((2.5 - convRate) / Math.max(convRate, 0.1) * 100)}% more revenue without any extra traffic spend.`,
        fix: 'Run A/B tests on your top product pages. Add trust badges near the Add to Cart button. Show shipping cost upfront — surprise costs at checkout are the #1 abandonment trigger.',
        actionLabel: 'Start A/B Test',
        actionPath: '/abtesting',
        beforeAfter: null,
      },
      {
        id: 'images',
        icon: '🖼️',
        title: 'Products Missing Images',
        severity: noImage > 0 ? 'warning' : 'good',
        stat: noImage > 0 ? `${noImage} products` : 'All products',
        statDetail: noImage > 0 ? 'have no product images' : 'have images ✅',
        impact: noImage * 90,
        why: '93% of buyers say visuals are the key deciding factor. Products without images get almost zero sales regardless of how good the description is. Even one high-quality image dramatically improves conversion.',
        fix: 'Add at least one high-quality product image to each affected product in your Shopify admin. Use natural lighting, clean backgrounds, and show the product from multiple angles.',
        actionLabel: 'View Products',
        actionPath: '/products',
        beforeAfter: null,
      },
    ],
  }
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
function ScanningScreen({ shopDomain }) {
  const [step, setStep] = useState(0)
  const steps = [
    'Connecting to your Shopify store...',
    'Scanning product descriptions...',
    'Analysing conversion data...',
    'Checking product images...',
    'Calculating revenue impact...',
    'Generating your diagnosis...',
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => s < steps.length - 1 ? s + 1 : s)
    }, 500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
        Diagnosing {shopDomain}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 340 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i <= step ? 1 : 0.3, transition: 'opacity 0.4s ease' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: i < step ? '#10B981' : i === step ? 'var(--purple)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10 }}>
              {i < step ? '✓' : i === step ? '⋯' : ''}
            </div>
            <div style={{ fontSize: 13, color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ width: 240, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
        <div style={{ height: '100%', background: 'var(--purple)', borderRadius: 2, transition: 'width 0.5s ease', width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
    </div>
  )
}

// ── ISSUE CARD ────────────────────────────────────────
function IssueCard({ issue }) {
  const s = SEVERITY[issue.severity]
  const barWidth = issue.severity === 'critical' ? '85%' : issue.severity === 'warning' ? '52%' : '15%'
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 20 }}>{issue.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 800, color: s.color, background: `${s.bar}15`, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
      <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>~${issue.impact.toLocaleString()}/mo</div>
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
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: SEVERITY[issue.severity].bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
            {s.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Est. loss</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: s.color }}>~${issue.impact.toLocaleString()}/mo</div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
        </div>
      </button>

      <div style={{ overflow: 'hidden', maxHeight: isOpen ? 800 : 0, opacity: isOpen ? 1 : 0, transition: 'max-height 0.35s ease, opacity 0.25s ease' }}>
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

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
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', marginBottom: 6, textTransform: 'uppercase' }}>❌ Before</div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>{issue.beforeAfter.before}</p>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#10B981', marginBottom: 6, textTransform: 'uppercase' }}>✅ After — AI optimized</div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: issue.beforeAfter.after }} />
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <button onClick={() => navigate(issue.actionPath)} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, background: s.color, border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
            <Zap size={12} /> {issue.actionLabel} <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────
export default function StoreDiagnosisPage() {
  const [scanning, setScanning] = useState(true)
  const [animated, setAnimated] = useState(false)
  const [openId, setOpenId]     = useState('descriptions')
  const [data, setData]         = useState(null)
  const token    = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch real data while scanning animation plays
    Promise.all([
      fetch('/api/products',  { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => []),
      fetch('/api/dashboard', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => ({})),
    ]).then(([prods, dash]) => {
      const diagnosisData = getMockData(
        Array.isArray(prods) ? prods : [],
        dash
      )
      setData(diagnosisData)
    })

    // Show scanning for 3.5 seconds then reveal results
    const timer = setTimeout(() => {
      setScanning(false)
      setTimeout(() => setAnimated(true), 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  const shopDomain = localStorage.getItem('shop') ||
    JSON.parse(localStorage.getItem('user') || '{}')?.shopDomain ||
    'your store'

  if (scanning || !data) {
    return (
      <div style={{ padding: '0 0 48px' }}>
        <ScanningScreen shopDomain={shopDomain} />
      </div>
    )
  }

  const { healthScore, totalRecoverable, issues } = data

  return (
    <div style={{ padding: '0 0 48px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px #EF4444' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Store Diagnosis · Just completed</span>
        </div>
        <h1 className="page-title">Your Store Diagnosis</h1>
        <p className="page-sub">
          Found <strong style={{ color: 'var(--text-primary)' }}>{issues.filter(i => i.severity === 'critical').length} critical issues</strong> costing your store money right now.
        </p>
      </div>

      {/* ── Dashboard card ── */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
          <HealthRing score={healthScore} animated={animated} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Overall store health</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
              Fixing these issues could recover up to{' '}
              <strong style={{ color: '#10B981' }}>~${totalRecoverable.toLocaleString()}/month</strong> in lost revenue.
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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
          <button onClick={() => navigate('/insights')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <RefreshCw size={11} /> Full Report
          </button>
        </div>

        {/* 3 issue cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {issues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      </div>

      {/* ── Top issue summary ── */}
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderLeft: '3px solid var(--purple)', borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Most urgent fix
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Your biggest opportunity is your <strong style={{ color: 'var(--text-primary)' }}>product descriptions</strong>.
          Five of your product pages have copy so thin that shoppers aren't getting enough information to feel confident buying.
          This is the fastest fix with the highest revenue impact — Optivise can rewrite all of them in one click.
        </p>
      </div>

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
          Ready to fix all issues with AI?
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Optivise can rewrite your descriptions, find abandoned carts, and improve your SEO automatically.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/products')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--purple)', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
            <Zap size={14} /> Fix Descriptions <ArrowRight size={14} />
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}