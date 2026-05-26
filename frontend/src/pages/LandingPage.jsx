import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Zap, Play, Menu, X, ArrowRight, CheckCircle, TrendingUp, Shield, Clock } from 'lucide-react'
import OptiviseLogo from '../components/OptiviseLogo'
import LogoText from '../components/LogoText'
import VarunPhoto from '../assets/varun.png'

// ── ANIMATED COUNTER ──────────────────────────────────
function AnimatedCounter({ target, prefix = '', suffix = '', duration = 1800, decimals = 0 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        let s = 0; const steps = 60; const inc = target / steps
        const t = setInterval(() => {
          s += inc
          if (s >= target) { setCount(target); clearInterval(t) }
          else setCount(parseFloat(s.toFixed(decimals)))
        }, duration / steps)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, duration])
  const display = decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString()
  return <span ref={ref}>{prefix}{display}{suffix}</span>
}

// ── TYPEWRITER ─────────────────────────────────────────
function TypewriterText({ texts, speed = 80 }) {
  const [idx, setIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const current = texts[idx]
    if (!deleting && displayed.length < current.length) {
      const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), speed)
      return () => clearTimeout(t)
    } else if (!deleting && displayed.length === current.length) {
      const t = setTimeout(() => setDeleting(true), 2200)
      return () => clearTimeout(t)
    } else if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), speed / 2)
      return () => clearTimeout(t)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setIdx((idx + 1) % texts.length)
    }
  }, [displayed, deleting, idx])
  return (
    <span style={{ color: '#6366f1' }}>
      {displayed}
      <span style={{ animation: 'blink 1s step-end infinite', color: '#6366f1' }}>|</span>
    </span>
  )
}

// ── LIVE DEMO ──────────────────────────────────────────
function LiveDemo() {
  const [productName, setProductName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const EXAMPLES = ['Leather Wallet', 'Running Shoes', 'Silk Scarf', 'Wooden Watch', 'Travel Bag']
  const steps = ['Analyzing product category...', 'Writing conversion copy...', 'Optimizing for SEO...', 'Done! ✓']

  const runDemo = async () => {
    if (!productName.trim()) return
    setGenerating(true); setResult(null); setError(''); setStep(0)
    let cs = 0
    const si = setInterval(() => { cs++; if (cs < steps.length - 1) setStep(cs); else clearInterval(si) }, 850)
    try {
      const res = await fetch('/api/demo/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: productName.trim() })
      })
      clearInterval(si); setStep(steps.length - 1)
      const text = await res.text()
      let parsed
      try { parsed = JSON.parse(text) }
      catch { const m = text.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null }
      if (!parsed) throw new Error('Invalid response')
      if (parsed.error) setError(parsed.error)
      else setResult(parsed)
    } catch (e) { clearInterval(si); setError('Generation failed — please try again') }
    finally { setGenerating(false) }
  }

  return (
    <div style={{ background: 'rgba(10,18,38,0.9)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(99,102,241,0.1), 0 32px 64px rgba(0,0,0,0.4)' }}>
      {/* Chrome bar */}
      <div style={{ background: 'rgba(15,25,50,0.9)', padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: '#334155', fontFamily: 'monospace' }}>optivise.ai · description generator</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, color: '#6366f1', fontWeight: 700, background: 'rgba(99,102,241,0.12)', padding: '2px 7px', borderRadius: 4, letterSpacing: '0.5px' }}>LIVE AI</span>
      </div>

      <div style={{ padding: '18px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', marginBottom: 7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Try it — any product in the world
        </div>
        <div style={{ display: 'flex', gap: 7, marginBottom: 9 }}>
          <input value={productName} onChange={e => setProductName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !generating && runDemo()}
            placeholder="e.g. Leather Wallet, Running Shoes..."
            style={{ flex: 1, background: 'rgba(15,25,50,0.8)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '9px 12px', color: '#e2e8f0', fontSize: 12, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.15)'} />
          <button onClick={runDemo} disabled={generating || !productName.trim()}
            style={{ background: generating ? 'rgba(99,102,241,0.4)' : '#6366f1', border: 'none', borderRadius: 10, padding: '9px 16px', color: 'white', fontSize: 12, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            <Sparkles size={11} />{generating ? 'Writing...' : 'Generate'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => setProductName(ex)}
              style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 20, padding: '2px 9px', fontSize: 10, color: '#475569', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(99,102,241,0.3)'; e.target.style.color = '#818cf8' }}
              onMouseLeave={e => { e.target.style.borderColor = 'rgba(99,102,241,0.1)'; e.target.style.color = '#475569' }}>
              {ex}
            </button>
          ))}
        </div>

        {generating && (
          <div style={{ background: 'rgba(15,25,50,0.8)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '3px 0', opacity: i <= step ? 1 : 0.25, transition: 'opacity 0.3s' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: i < step ? 'rgba(16,185,129,0.2)' : i === step ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i < step ? '#10b981' : i === step ? '#6366f1' : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, flexShrink: 0, color: i < step ? '#10b981' : '#6366f1' }}>
                  {i < step ? '✓' : i === step ? '·' : ''}
                </div>
                <span style={{ fontSize: 11, color: i <= step ? '#94a3b8' : '#1e293b' }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {error && !generating && (
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#ef4444', marginBottom: 12 }}>{error}</div>
        )}

        {result && !generating && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 9 }}>
              <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 12, padding: '11px' }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>❌ Before</div>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>{result.before}</div>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: '11px' }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: '#10b981', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ AI Optimized</div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: result.after }} />
              </div>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 9, padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 600 }}>🎯 {result.score}</span>
              <span onClick={() => window.location.href = '/register'} style={{ fontSize: 10, color: '#6366f1', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                Save to your store <ArrowRight size={9} />
              </span>
            </div>
          </div>
        )}

        {!result && !generating && !error && (
          <div style={{ textAlign: 'center', padding: '20px 0', background: 'rgba(15,25,50,0.5)', borderRadius: 12 }}>
            <Sparkles size={20} color="#6366f1" style={{ marginBottom: 7, opacity: 0.5 }} />
            <div style={{ fontSize: 12, color: '#1e3a5f' }}>Type any product · Real AI · Zero sign-up needed</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── DIAGNOSIS PREVIEW CARD ─────────────────────────────
function DiagnosisCard() {
  const leaks = [
    { icon: '📝', title: 'Weak Descriptions', impact: '$1,240/mo', sev: '#EF4444', bar: '85%' },
    { icon: '📉', title: 'High Cart Abandonment', impact: '$890/mo', sev: '#F59E0B', bar: '52%' },
    { icon: '🔍', title: 'Missing Meta Tags', impact: '$320/mo', sev: '#F59E0B', bar: '40%' },
  ]
  return (
    <div style={{ background: 'rgba(10,18,38,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
      <div style={{ background: 'rgba(15,25,50,0.9)', padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: '#334155', fontFamily: 'monospace' }}>optivise.ai · store diagnosis</span>
        <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
      </div>
      <div style={{ padding: '18px' }}>
        {/* Health score mini */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
            <svg viewBox="0 0 52 52" style={{ width: '100%', height: '100%' }}>
              <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
              <circle cx="26" cy="26" r="20" fill="none" stroke="#EF4444" strokeWidth="5"
                strokeLinecap="round" strokeDasharray="125.7" strokeDashoffset="50"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '26px 26px', filter: 'drop-shadow(0 0 4px #EF444460)' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#EF4444' }}>42</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Store Health: Critical</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>3 revenue leaks detected</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', marginTop: 3 }}>~$2,450/mo recoverable</div>
          </div>
        </div>
        {/* Leaks */}
        {leaks.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < leaks.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
            <span style={{ fontSize: 16 }}>{l.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1', marginBottom: 3 }}>{l.title}</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: l.bar, background: l.sev, borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: l.sev, flexShrink: 0 }}>{l.impact}</div>
          </div>
        ))}
        <button onClick={() => window.location.href = '/register'} style={{ width: '100%', marginTop: 12, background: '#6366f1', border: 'none', borderRadius: 10, padding: '10px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
  <Zap size={11} /> Fix all leaks with AI
</button>
      </div>
    </div>
  )
}

// ── MAIN LANDING PAGE ──────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const [navScrolled, setNavScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [billingYearly, setBillingYearly] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const scrollToDemo = () => document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' })

  const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'My story', href: '#my-story' },
  ]

  return (
    <div style={{ background: '#020817', color: '#e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.2),0 0 60px rgba(99,102,241,0.05)} 50%{box-shadow:0 0 30px rgba(99,102,241,0.4),0 0 80px rgba(99,102,241,0.1)} }
        @keyframes shimmer { from{background-position:-200% center} to{background-position:200% center} }
        @keyframes rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes scanline { 0%{top:-10%} 100%{top:110%} }
        .hero-animate { animation: slideUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-animate-2 { animation: slideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .hero-animate-3 { animation: slideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .hero-animate-4 { animation: slideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
        .float-card { animation: float 5s ease-in-out infinite; }
        .glow-cta { animation: pulse-glow 3s ease-in-out infinite; }
        .hover-lift { transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-3px); border-color: rgba(99,102,241,0.3) !important; box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important; }
        .instrument { font-family: 'Instrument Serif', Georgia, serif; }
        .dm-sans { font-family: 'DM Sans', -apple-system, sans-serif; }
        .shimmer-text { background: linear-gradient(90deg, #fff 0%, #818cf8 40%, #fff 80%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        /* MOBILE */
        @media (max-width: 768px) {
          .desktop-nav-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .hero-h1 { font-size: 38px !important; letter-spacing: -1.5px !important; }
          .hero-btns { flex-direction: column !important; }
          .hero-btns button, .hero-btns a { width: 100% !important; justify-content: center !important; }
          .trust-bar { flex-wrap: wrap !important; gap: 8px !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .pain-grid { grid-template-columns: repeat(2,1fr) !important; }
          .ba-grid { grid-template-columns: 1fr !important; }
          .ba-arrow { display: none !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .connector { display: none !important; }
          .features-grid { grid-template-columns: repeat(2,1fr) !important; }
          .founder-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 10px !important; text-align: center !important; }
          .section-pad { padding: 48px 20px !important; }
          .hero-section { padding: 48px 20px 32px !important; }
          .nav-wrap { padding: 12px 20px !important; }
        }
        @media (max-width: 480px) {
          .hero-h1 { font-size: 30px !important; }
          .pain-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── ANNOUNCEMENT BAR ── */}
      <div style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.12), rgba(6,182,212,0.08), rgba(99,102,241,0.12))', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '9px 24px', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
        🚀 Connect your Shopify store and get your free diagnosis in 60 seconds →{' '}
        <span onClick={() => navigate('/register')} style={{ color: '#818cf8', textDecoration: 'none', cursor: 'pointer', fontWeight: 700 }}>
          Start free
        </span>
      </div>

      {/* ── STICKY NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: navScrolled ? 'rgba(2,8,23,0.96)' : 'rgba(2,8,23,0.7)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${navScrolled ? 'rgba(255,255,255,0.06)' : 'transparent'}`, transition: 'all 0.3s ease' }}>
        <div className="nav-wrap" style={{ padding: '13px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <OptiviseLogo size={30} showText={false} />
            <LogoText nameSize={15} tagSize={7} />
          </div>
          {/* Desktop nav */}
          <div className="desktop-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} style={{ fontSize: 13, color: '#475569', textDecoration: 'none', transition: 'color 0.15s', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}
                onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                onMouseLeave={e => e.target.style.color = '#475569'}>
                {label}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button onClick={() => navigate('/login')} className="desktop-nav-links" style={{ display: 'flex', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '7px 16px', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#e2e8f0' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#64748b' }}>
              Log in
            </button>
            <button onClick={() => navigate('/register')} className="glow-cta" style={{ background: '#6366f1', border: 'none', borderRadius: 9, padding: '8px 18px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
              Get diagnosis free →
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px', color: '#94a3b8', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}>
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div style={{ background: '#080f20', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px' }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '11px 0', fontSize: 14, color: '#94a3b8', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {label}
              </a>
            ))}
            <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
              <button onClick={() => navigate('/login')} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '10px', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Log in</button>
              <button onClick={() => navigate('/register')} style={{ flex: 1, background: '#6366f1', border: 'none', borderRadius: 9, padding: '10px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Start free</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section section-pad" style={{ padding: '72px 40px 56px', maxWidth: 1120, margin: '0 auto' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <div className="hero-animate" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 24, padding: '5px 12px 5px 8px', fontSize: 11, color: '#6ee7b7', marginBottom: 22 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              Live · Free diagnosis · No credit card
            </div>

            <h1 className="hero-animate-2 instrument hero-h1" style={{ fontSize: 56, fontWeight: 400, lineHeight: 1.06, letterSpacing: '-2px', color: '#fff', marginBottom: 6 }}>
              Connect your store.
            </h1>
            <h1 className="hero-animate-2 instrument hero-h1" style={{ fontSize: 56, fontWeight: 400, lineHeight: 1.06, letterSpacing: '-2px', color: '#fff', marginBottom: 6 }}>
              Get your diagnosis
            </h1>
            <h1 className="hero-animate-2 hero-h1" style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.06, letterSpacing: '-2px', color: '#fff', marginBottom: 20 }}>
              in <span style={{ color: '#6366f1', fontFamily: 'Instrument Serif, Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>60 seconds.</span>
            </h1>

            <p className="hero-animate-3 dm-sans" style={{ fontSize: 15, color: '#64748b', lineHeight: 1.75, marginBottom: 30, maxWidth: 430 }}>
              Optivise scans your real Shopify data and tells you exactly where revenue is leaking — with dollar amounts and one-click AI fixes.
            </p>

            <div className="hero-animate-4 hero-btns" style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
              <button onClick={() => navigate('/register')} className="glow-cta" style={{ background: '#6366f1', border: 'none', borderRadius: 12, padding: '14px 26px', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif' }}>
                <Zap size={14} /> Get free diagnosis
              </button>
              <button onClick={scrollToDemo} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '14px 20px', color: '#94a3b8', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e2e8f0' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8' }}>
                <Play size={11} fill="#94a3b8" /> Try AI demo
              </button>
            </div>

            <div className="hero-animate-4 trust-bar" style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {['Official Shopify OAuth', 'Read-only access', 'Free forever', '60-second setup'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#334155', fontFamily: 'DM Sans, sans-serif' }}>
                  <CheckCircle size={11} color="#10b981" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Diagnosis card */}
          <div className="float-card">
            <DiagnosisCard />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <div style={{ background: 'rgba(10,18,38,0.8)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '22px 40px' }}>
        <div className="stats-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', textAlign: 'center', gap: 16 }}>
          {[
            { num: 256757, prefix: '$', suffix: '', decimals: 0, label: 'Revenue analyzed' },
            { num: 42, prefix: '', suffix: '%', decimals: 0, label: 'Avg. revenue leak found' },
            { num: 60, prefix: '', suffix: 's', decimals: 0, label: 'Time to first diagnosis' },
            { num: 6, prefix: '', suffix: ' weeks', decimals: 0, label: 'To build the platform' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1px', fontFamily: 'DM Sans, sans-serif' }}>
                {s.prefix}<AnimatedCounter target={s.num} duration={1800} decimals={s.decimals} />{s.suffix}
              </div>
              <div style={{ fontSize: 11, color: '#334155', marginTop: 3, fontFamily: 'DM Sans, sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAIN POINTS ── */}
      <section id="features" className="section-pad" style={{ padding: '72px 40px', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 20, padding: '4px 14px', fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '1.5px', marginBottom: 14, textTransform: 'uppercase' }}>The real problem</div>
          <h2 className="instrument" style={{ fontSize: 36, fontWeight: 400, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 10 }}>
            Most Shopify owners are<br /><em>flying completely blind.</em>
          </h2>
          <p className="dm-sans" style={{ fontSize: 14, color: '#475569', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>These aren't hypothetical. They're the exact conversations Shopify store owners are having on Reddit right now.</p>
        </div>
        <div className="pain-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
          {[
            { icon: '📝', problem: '"My descriptions are terrible but I don\'t know how to write them."', loss: '−$720/mo' },
            { icon: '📊', problem: '"I have no idea which of my 47 products are actually making me money."', loss: '−$1,200/mo' },
            { icon: '💸', problem: '"I spent $300 on ads last week. No idea if it worked."', loss: '−$900/mo' },
            { icon: '🛒', problem: '"My conversion rate is 1.2% and I have no idea why people aren\'t buying."', loss: '−$1,800/mo' },
            { icon: '😤', problem: '"I have 15 tabs open and no single place that shows me what\'s wrong."', loss: '−$600/mo' },
          ].map((p, i) => (
            <div key={i} className="hover-lift" style={{ background: 'rgba(10,18,38,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '18px 14px' }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{p.icon}</div>
              <div className="dm-sans" style={{ fontSize: 11, color: '#475569', lineHeight: 1.65, marginBottom: 12 }}>{p.problem}</div>
              <div className="dm-sans" style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.07)', borderRadius: 6, padding: '3px 9px', display: 'inline-block' }}>{p.loss}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <p className="dm-sans" style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>Optivise gives you one place that answers all of this. In 60 seconds.</p>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="section-pad" style={{ padding: '72px 40px', background: 'rgba(6,14,30,0.9)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '4px 14px', fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: '1.5px', marginBottom: 14, textTransform: 'uppercase' }}>Real example</div>
            <h2 className="instrument" style={{ fontSize: 34, fontWeight: 400, color: '#fff', letterSpacing: '-1.5px', marginBottom: 8, lineHeight: 1.2 }}>
              Same product. 30 seconds apart.<br /><em>Completely different result.</em>
            </h2>
          </div>
          <div className="ba-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 14, alignItems: 'stretch' }}>
            <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 16, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ background: 'rgba(239,68,68,0.12)', borderRadius: 6, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#ef4444' }}>❌ Before</div>
                <span className="dm-sans" style={{ fontSize: 11, color: '#334155' }}>What store owners typically write</span>
              </div>
              <div style={{ background: 'rgba(10,18,38,0.8)', borderRadius: 10, padding: '12px', fontSize: 12, color: '#475569', lineHeight: 1.8, fontStyle: 'italic', fontFamily: 'DM Sans, sans-serif' }}>
                "Premium leather jacket. Size M/L/XL. Black color. Multiple pockets. Good quality material. Fast shipping available."
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                {[['1.1%', 'conversion'], ['F', 'SEO grade'], ['4s', 'avg. time']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center', flex: 1, background: 'rgba(239,68,68,0.05)', borderRadius: 8, padding: '8px' }}>
                    <div className="dm-sans" style={{ fontSize: 18, fontWeight: 900, color: '#ef4444' }}>{v}</div>
                    <div className="dm-sans" style={{ fontSize: 9, color: '#334155', marginTop: 1 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ba-arrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#6366f1', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>✨</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 16, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ background: 'rgba(16,185,129,0.12)', borderRadius: 6, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#10b981' }}>✅ After</div>
                <span className="dm-sans" style={{ fontSize: 11, color: '#334155' }}>Optivise AI · 30 seconds</span>
              </div>
              <div style={{ background: 'rgba(10,18,38,0.8)', borderRadius: 10, padding: '12px', fontSize: 12, color: '#94a3b8', lineHeight: 1.8, fontFamily: 'DM Sans, sans-serif' }}>
                <strong style={{ color: '#f1f5f9' }}>The Last Jacket You'll Ever Need.</strong><br />
                Full-grain leather that develops a rich patina over time — built for people who refuse to compromise. Four deep pockets, a cut that works at the office and after hours.<br />
                <span style={{ color: '#10b981' }}>★ 30-day returns. Ships in 24h.</span>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                {[['4.2%', 'conversion'], ['A', 'SEO grade'], ['3.8×', 'time on page']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center', flex: 1, background: 'rgba(16,185,129,0.05)', borderRadius: 8, padding: '8px' }}>
                    <div className="dm-sans" style={{ fontSize: 18, fontWeight: 900, color: '#10b981' }}>{v}</div>
                    <div className="dm-sans" style={{ fontSize: 9, color: '#334155', marginTop: 1 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ── */}
      <section className="section-pad" style={{ padding: '72px 40px', maxWidth: 900, margin: '0 auto' }} id="live-demo">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '4px 14px', fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: '1.5px', marginBottom: 14, textTransform: 'uppercase' }}>Live AI demo</div>
          <h2 className="instrument" style={{ fontSize: 34, fontWeight: 400, color: '#fff', letterSpacing: '-1.5px', marginBottom: 8 }}>
            Try it yourself. Right now.<br /><em>No account needed.</em>
          </h2>
          <p className="dm-sans" style={{ fontSize: 14, color: '#475569' }}>Type any product name. Real AI writes the perfect description in seconds.</p>
        </div>
        <LiveDemo />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section-pad" style={{ padding: '72px 40px', background: 'rgba(6,14,30,0.9)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '4px 14px', fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: '1.5px', marginBottom: 14, textTransform: 'uppercase' }}>How it works</div>
            <h2 className="instrument" style={{ fontSize: 34, fontWeight: 400, color: '#fff', letterSpacing: '-1.5px', marginBottom: 8 }}>
              From connected to growing<br /><em>in three steps.</em>
            </h2>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, position: 'relative' }}>
            <div className="connector" style={{ position: 'absolute', top: 36, left: '18%', right: '18%', height: 1, background: 'linear-gradient(90deg,#6366f1,#06b6d4,#10b981)', opacity: 0.25 }} />
            {[
              { step: '01', color: '#6366f1', emoji: '🔗', title: 'Connect your store', body: 'Authorize with official Shopify OAuth. We pull your real products, orders, and revenue. Takes 90 seconds.', note: 'Read-only · Never modify without permission' },
              { step: '02', color: '#06b6d4', emoji: '🧠', title: 'AI runs your diagnosis', body: 'Optivise scans every product, your conversion rate, and compares against industry benchmarks to find revenue leaks.', note: 'Powered by GPT-4o · Real store data only' },
              { step: '03', color: '#10b981', emoji: '🚀', title: 'Fix and watch revenue grow', body: 'Get a ranked list of exactly what to fix. Generate AI descriptions in 1 click. Apply directly to Shopify.', note: 'Average improvement visible within 7 days' },
            ].map((s, i) => (
              <div key={i} className="hover-lift" style={{ background: 'rgba(10,18,38,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '24px 20px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${s.color}12`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{s.emoji}</div>
                <div className="dm-sans" style={{ fontSize: 10, fontWeight: 700, color: s.color, marginBottom: 6, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Step {s.step}</div>
                <div className="dm-sans" style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{s.title}</div>
                <div className="dm-sans" style={{ fontSize: 12, color: '#475569', lineHeight: 1.7, marginBottom: 12 }}>{s.body}</div>
                <div className="dm-sans" style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.note}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button onClick={() => navigate('/register')} style={{ background: '#6366f1', border: 'none', borderRadius: 12, padding: '13px 28px', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif' }}>
              <Zap size={13} /> Get my free diagnosis
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section-pad" style={{ padding: '72px 40px', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 className="instrument" style={{ fontSize: 34, fontWeight: 400, color: '#fff', letterSpacing: '-1.5px', marginBottom: 8 }}>
            Everything your store needs.<br /><em>Nothing you don't.</em>
          </h2>
          <p className="dm-sans" style={{ fontSize: 14, color: '#475569' }}>Built from scratch. No templates. No no-code shortcuts. Pure Java + React.</p>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { icon: '🩺', color: '#EF4444', title: 'Store Diagnosis', desc: 'Connect your store and get your health score + ranked revenue leaks in 60 seconds. The feature that started it all.', badge: 'Core feature', progress: 95 },
            { icon: '✨', color: '#6366f1', title: 'AI Product Descriptions', desc: '1-click AI rewrites for every product. Saves directly to Shopify. Your originals are always backed up.', badge: 'Most used', progress: 88 },
            { icon: '📉', color: '#F59E0B', title: 'Revenue Leak Detector', desc: 'Finds exactly where you\'re losing money — with specific dollar amounts and one-click fixes.', badge: 'Highest ROI', progress: 92 },
            { icon: '📊', color: '#06b6d4', title: 'Real Analytics', desc: 'Revenue, orders, and conversion rate pulled directly from your Shopify data. No estimates.', badge: null, progress: 78 },
            { icon: '🧪', color: '#F59E0B', title: 'A/B Testing', desc: 'Test two description variants on any product. Let real conversion data pick the winner.', badge: null, progress: 72 },
            { icon: '🏥', color: '#10b981', title: 'Store Health Score', desc: '0–100 score with 6 detailed health checks. See exactly what\'s working and what\'s hurting you.', badge: null, progress: 85 },
          ].map((f, i) => (
            <div key={i} className="hover-lift" style={{ background: 'rgba(10,18,38,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '20px', position: 'relative' }}>
              {f.badge && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: `${f.color}10`, border: `1px solid ${f.color}25`, borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: f.color, fontFamily: 'DM Sans, sans-serif' }}>{f.badge}</div>
              )}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${f.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12 }}>{f.icon}</div>
              <div className="dm-sans" style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 7 }}>{f.title}</div>
              <div className="dm-sans" style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, marginBottom: 14 }}>{f.desc}</div>
              <div style={{ height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ height: '100%', borderRadius: 2, background: f.color, width: `${f.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOUNDER ── */}
      <section id="my-story" className="section-pad" style={{ padding: '72px 40px', background: 'rgba(6,14,30,0.9)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="founder-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 60, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative' }}>
                <img src={VarunPhoto} alt="Varun" style={{ width: 140, height: 140, objectFit: 'contain', filter: 'drop-shadow(0 0 30px rgba(99,102,241,0.5))' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="dm-sans" style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Varun Kumar Konnoju</div>
                <div className="dm-sans" style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>MS Computer Science</div>
                <div className="dm-sans" style={{ fontSize: 11, color: '#475569' }}>Concordia University of Wisconsin</div>
              </div>
              <div style={{ background: 'rgba(10,18,38,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 18px', width: '100%' }}>
                <div className="dm-sans" style={{ fontSize: 9, fontWeight: 700, color: '#334155', letterSpacing: '1px', marginBottom: 12, textTransform: 'uppercase' }}>Build timeline</div>
                {[
                  { w: 'Wk 1–2', t: 'Auth, DB, user accounts', c: '#6366f1' },
                  { w: 'Wk 3', t: 'Shopify OAuth + real data', c: '#06b6d4' },
                  { w: 'Wk 4', t: 'AI descriptions (GPT-4o)', c: '#f59e0b' },
                  { w: 'Wk 5', t: 'Analytics + A/B testing', c: '#10b981' },
                  { w: 'Wk 6', t: 'Store diagnosis + polish', c: '#96bf48' },
                  { w: 'Now', t: 'Live · Building in public 🙏', c: '#818cf8' },
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '5px 0', borderLeft: '1px solid rgba(255,255,255,0.04)', paddingLeft: 14, marginLeft: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.c, flexShrink: 0, marginTop: 3, marginLeft: -18, boxShadow: `0 0 5px ${t.c}` }} />
                    <div>
                      <div className="dm-sans" style={{ fontSize: 9, fontWeight: 700, color: t.c }}>{t.w}</div>
                      <div className="dm-sans" style={{ fontSize: 10, color: '#475569' }}>{t.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 20, padding: '4px 12px', fontSize: 10, fontWeight: 700, color: '#f59e0b', marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}>
                👋 The founder
              </div>
              <h2 className="instrument" style={{ fontSize: 36, fontWeight: 400, color: '#fff', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-1.5px' }}>
                I graduated in December.<br />
                I had to wait for my visa.<br />
                <em style={{ color: '#6366f1' }}>So I built instead.</em>
              </h2>
              <p className="dm-sans" style={{ fontSize: 13, color: '#475569', lineHeight: 1.8, marginBottom: 12 }}>
                After finishing my MS in Computer Science at Concordia University of Wisconsin, I had to wait for my US work authorization. No job. No income. Just time and curiosity.
              </p>
              <p className="dm-sans" style={{ fontSize: 13, color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>
                I noticed Shopify store owners were losing thousands of dollars every month without knowing why. Their analytics showed them numbers, but never answers. So I spent 6 weeks building the tool I wished existed.
              </p>
              <div style={{ background: 'rgba(10,18,38,0.8)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', padding: '14px 18px', marginBottom: 20 }}>
                <div className="instrument" style={{ fontSize: 17, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.7 }}>
                  "I wanted to build something that feels like having a financial advisor for your Shopify store. One that works 24/7, costs nothing, and tells you exactly what to fix."
                </div>
              </div>
              <div style={{ background: 'rgba(10,18,38,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 16px' }}>
                <div className="dm-sans" style={{ fontSize: 9, fontWeight: 700, color: '#334155', letterSpacing: '1px', marginBottom: 10, textTransform: 'uppercase' }}>Building in public</div>
                {[
                  { c: '#10b981', t: 'Platform fully live at optiviseai.io' },
                  { c: '#10b981', t: 'Shopify OAuth working in production' },
                  { c: '#10b981', t: 'Store diagnosis running on real data' },
                  { c: '#f59e0b', t: 'Sharing everything publicly on Reddit' },
                  { c: '#6366f1', t: 'OPT work authorization in progress' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 11, color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.c, flexShrink: 0 }} />
                    {s.t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="section-pad" style={{ padding: '72px 40px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="instrument" style={{ fontSize: 34, fontWeight: 400, color: '#fff', letterSpacing: '-1.5px', marginBottom: 8 }}>
            Start free. Upgrade when ready.
          </h2>
          <p className="dm-sans" style={{ fontSize: 14, color: '#475569', marginBottom: 20 }}>No credit card. No sales call. No dark patterns.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <span className="dm-sans" style={{ fontSize: 13, color: billingYearly ? '#334155' : '#e2e8f0' }}>Monthly</span>
            <div onClick={() => setBillingYearly(!billingYearly)} style={{ width: 44, height: 24, borderRadius: 12, background: billingYearly ? '#6366f1' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: billingYearly ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
            </div>
            <span className="dm-sans" style={{ fontSize: 13, color: billingYearly ? '#e2e8f0' : '#334155' }}>Yearly <span style={{ color: '#10b981', fontWeight: 700, fontSize: 11 }}>–20%</span></span>
          </div>
        </div>
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, alignItems: 'start' }}>
          {[
            { name: 'Free', price: 0, yearly: 0, color: '#6366f1', popular: false, desc: 'Perfect to start', features: ['15 AI descriptions/month', 'Store Diagnosis', 'Revenue Leak Detector', 'Store Health Score', 'Basic Analytics', 'Description History'], cta: 'Start free forever', ghost: true },
            { name: 'Starter', price: 29, yearly: 23, color: '#06b6d4', popular: true, desc: 'For serious growth', features: ['500 AI descriptions/month', 'Everything in Free', 'A/B Testing', 'AI Assistant', 'Weekly email reports', 'Priority support'], cta: 'Start free trial', ghost: false },
            { name: 'Growth', price: 79, yearly: 63, color: '#10b981', popular: false, desc: 'Scale without limits', features: ['Unlimited AI descriptions', 'Everything in Starter', 'Advanced analytics', 'Revenue forecasting', 'Dedicated support', 'API access (soon)'], cta: 'Start free trial', ghost: true },
          ].map((p, i) => (
            <div key={i} className="hover-lift" style={{ background: p.popular ? 'rgba(6,182,212,0.04)' : 'rgba(10,18,38,0.8)', border: p.popular ? '2px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.05)', borderRadius: 18, padding: '26px 22px', position: 'relative' }}>
              {p.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#06b6d4', borderRadius: 20, padding: '3px 14px', fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>Most Popular</div>
              )}
              <div className="dm-sans" style={{ fontSize: 13, fontWeight: 700, color: p.color, marginBottom: 2 }}>{p.name}</div>
              <div className="dm-sans" style={{ fontSize: 11, color: '#334155', marginBottom: 16 }}>{p.desc}</div>
              <div style={{ marginBottom: 20 }}>
                <span className="dm-sans" style={{ fontSize: 38, fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>${billingYearly ? p.yearly : p.price}</span>
                <span className="dm-sans" style={{ fontSize: 12, color: '#334155' }}>/mo</span>
                {p.price === 0 && <div className="dm-sans" style={{ fontSize: 10, color: '#10b981', fontWeight: 700, marginTop: 3 }}>Free forever — no limits on diagnosis</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#64748b', fontFamily: 'DM Sans, sans-serif' }}>
                    <CheckCircle size={11} color={p.color} style={{ flexShrink: 0 }} />{f}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/register')} style={{ width: '100%', borderRadius: 11, padding: '12px', background: p.ghost ? 'transparent' : p.color, border: `1px solid ${p.color}`, color: p.ghost ? p.color : '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section-pad" style={{ padding: '80px 40px', textAlign: 'center', background: 'rgba(6,14,30,0.9)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '4px 14px', fontSize: 10, fontWeight: 700, color: '#6366f1', marginBottom: 20, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Free · No credit card · 60 seconds
          </div>
          <h2 className="instrument" style={{ fontSize: 48, fontWeight: 400, color: '#fff', letterSpacing: '-2px', marginBottom: 12, lineHeight: 1.1 }}>
            Your store has leaks.<br /><em style={{ color: '#6366f1' }}>Let's find them.</em>
          </h2>
          <p className="dm-sans" style={{ fontSize: 15, color: '#475569', lineHeight: 1.75, marginBottom: 32 }}>
            Connect your Shopify store in 60 seconds and see exactly how much revenue you're leaving on the table — with a ranked list of fixes and one-click AI solutions.
          </p>
          <button onClick={() => navigate('/register')} className="glow-cta" style={{ background: '#6366f1', border: 'none', borderRadius: 14, padding: '16px 36px', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: 'DM Sans, sans-serif', marginBottom: 14 }}>
            <Zap size={15} /> Get my free diagnosis
          </button>
          <div className="dm-sans" style={{ fontSize: 12, color: '#1e3a5f' }}>No credit card · Cancel anytime · Official Shopify OAuth</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#010c1a', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '24px 40px' }}>
        <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="dm-sans" style={{ fontSize: 11, color: '#1e3a5f' }}>© 2025 Optivise AI · Built by Varun Kumar Konnoju · Milwaukee, WI</div>
          <div style={{ display: 'flex', gap: 18 }}>
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Help', '/help']].map(([l, h]) => (
              <span key={l} onClick={() => navigate(h)} className="dm-sans" style={{ fontSize: 11, color: '#1e3a5f', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#475569'}
                onMouseLeave={e => e.target.style.color = '#1e3a5f'}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#6366f1,#06b6d4,#10b981)' }} />
    </div>
  )
}