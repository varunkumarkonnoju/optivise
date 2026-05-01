import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'
import OptiviseLogo from '../components/OptiviseLogo'

// ── Mouse tracker hook ────────────────────────────────────────────────────────
function useMouse() {
  const mouse = useRef({ x: 0, y: 0, nx: 0, ny: 0 })
  useEffect(() => {
    const h = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
      mouse.current.nx = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.current.ny = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])
  return mouse
}

// ── Magnetic button ───────────────────────────────────────────────────────────
function MagneticBtn({ children, className, onClick, style }) {
  const ref = useRef(null)
  const raf = useRef(null)
  const pos = useRef({ x: 0, y: 0 })

  const onMove = (e) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width  / 2
    const cy = r.top  + r.height / 2
    const dx = (e.clientX - cx) * 0.35
    const dy = (e.clientY - cy) * 0.35
    cancelAnimationFrame(raf.current)
    const anim = () => {
      pos.current.x += (dx - pos.current.x) * 0.18
      pos.current.y += (dy - pos.current.y) * 0.18
      if (el) el.style.transform = `translate(${pos.current.x}px,${pos.current.y}px) scale(1.07)`
      raf.current = requestAnimationFrame(anim)
    }
    raf.current = requestAnimationFrame(anim)
  }

  const onLeave = () => {
    cancelAnimationFrame(raf.current)
    const el = ref.current; if (!el) return
    const anim = () => {
      pos.current.x *= 0.82
      pos.current.y *= 0.82
      if (el) el.style.transform = `translate(${pos.current.x}px,${pos.current.y}px) scale(1)`
      if (Math.abs(pos.current.x) > 0.1 || Math.abs(pos.current.y) > 0.1)
        raf.current = requestAnimationFrame(anim)
    }
    raf.current = requestAnimationFrame(anim)
  }

  return (
    <button ref={ref} className={className} onClick={onClick} style={style}
      onMouseMove={onMove} onMouseLeave={onLeave}>{children}</button>
  )
}

// ── 3D Tilt card ──────────────────────────────────────────────────────────────
function TiltCard({ children, className, style, intensity = 1 }) {
  const ref = useRef(null)
  const raf = useRef(null)
  const cur = useRef({ rx: 0, ry: 0 })
  const tgt = useRef({ rx: 0, ry: 0 })

  const onMove = (e) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    tgt.current.rx = ((e.clientY - r.top)  / r.height - 0.5) * -18 * intensity
    tgt.current.ry = ((e.clientX - r.left) / r.width  - 0.5) *  22 * intensity
  }
  const onLeave = () => { tgt.current = { rx: 0, ry: 0 } }

  useEffect(() => {
    const el = ref.current; if (!el) return
    const animate = () => {
      cur.current.rx += (tgt.current.rx - cur.current.rx) * 0.08
      cur.current.ry += (tgt.current.ry - cur.current.ry) * 0.08
      const shine = `radial-gradient(circle at ${50 + cur.current.ry * 1.5}% ${50 + cur.current.rx * 1.5}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
      el.style.transform = `perspective(1000px) rotateX(${cur.current.rx}deg) rotateY(${cur.current.ry}deg)`
      el.style.setProperty('--shine', shine)
      raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  return (
    <div ref={ref} className={className} style={style}
      onMouseMove={onMove} onMouseLeave={onLeave}>{children}</div>
  )
}

// ── Particle cursor trail ─────────────────────────────────────────────────────
function CursorTrail() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')
    const particles = []
    let w = c.width = window.innerWidth
    let h = c.height = window.innerHeight
    window.addEventListener('resize', () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight })

    const onMove = (e) => {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: e.clientX, y: e.clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 1,
          life: 1, r: Math.random() * 3 + 1,
          hue: Math.random() > 0.5 ? 250 : 190
        })
      }
    }
    window.addEventListener('mousemove', onMove)

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy
        p.vy += 0.05; p.life -= 0.025
        if (p.life <= 0) { particles.splice(i, 1); continue }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},80%,65%,${p.life * 0.6})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999 }}/>
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ end, prefix='', suffix='', duration=2000 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const start = Date.now()
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        setVal(Math.floor(ease * end))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end, duration])

  // Smart display: on mobile show 2.4M, on desktop show full 2,400,000
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  let display
  if (isMobile && val >= 1000000) {
    display = (val / 1000000).toFixed(1) + 'M'
  } else if (isMobile && val >= 1000) {
    display = (val / 1000).toFixed(0) + 'k'
  } else {
    display = val.toLocaleString()
  }

  return <span ref={ref}>{prefix}{display}{suffix}</span>
}

// ── Floating orbs background ──────────────────────────────────────────────────
function FloatingOrbs() {
  const mouse = useMouse()
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    let raf
    const orbs = el.querySelectorAll('.land-orb')
    const animate = () => {
      const { nx, ny } = mouse.current
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 0.012
        const ox = nx * 40 * factor
        const oy = ny * 40 * factor
        orb.style.transform = `translate(${ox}px, ${oy}px)`
      })
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div ref={ref} className="land-orbs" aria-hidden>
      <div className="land-orb land-orb-1"/>
      <div className="land-orb land-orb-2"/>
      <div className="land-orb land-orb-3"/>
      <div className="land-orb land-orb-4"/>
    </div>
  )
}

// ── 3D Dashboard mockup ───────────────────────────────────────────────────────
function Dashboard3D() {
  const wrapRef = useRef(null)
  const cardRef = useRef(null)
  const glowRef = useRef(null)
  const raf = useRef(null)
  const cur = useRef({ rx: -12, ry: 15, gx: 50, gy: 50 })
  const tgt = useRef({ rx: -12, ry: 15, gx: 50, gy: 50 })

  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top)  / r.height
      tgt.current.rx = (py - 0.5) * -22
      tgt.current.ry = (px - 0.5) *  28
      tgt.current.gx = px * 100
      tgt.current.gy = py * 100
    }
    const onLeave = () => { tgt.current.rx = -12; tgt.current.ry = 15; tgt.current.gx = 50; tgt.current.gy = 50 }
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)
    const animate = () => {
      const c = cur.current; const t = tgt.current
      c.rx += (t.rx - c.rx) * 0.06
      c.ry += (t.ry - c.ry) * 0.06
      c.gx += (t.gx - c.gx) * 0.06
      c.gy += (t.gy - c.gy) * 0.06
      if (cardRef.current)
        cardRef.current.style.transform = `perspective(1100px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale3d(1,1,1)`
      if (glowRef.current)
        glowRef.current.style.background = `radial-gradient(ellipse at ${c.gx}% ${c.gy}%, rgba(99,102,241,0.5) 0%, rgba(6,182,212,0.2) 35%, transparent 65%)`
      raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => {
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div ref={wrapRef} className="d3-wrap">
      <div ref={glowRef} className="d3-glow"/>
      {/* Depth layers */}
      <div className="d3-shadow-card"/>
      <div className="d3-mid-card"/>
      <div ref={cardRef} className="d3-card">
        {/* Chrome */}
        <div className="d3-chrome">
          <span className="d3-dot" style={{background:'#FF5F57'}}/>
          <span className="d3-dot" style={{background:'#FEBC2E'}}/>
          <span className="d3-dot" style={{background:'#28C840'}}/>
          <span className="d3-url">app.optivise.io</span>
          <div className="d3-chrome-right">
            <div className="d3-live-dot"/>
            <span style={{fontSize:9,color:'#10B981'}}>live</span>
          </div>
        </div>
        <div className="d3-body">
          {/* Sidebar */}
          <div className="d3-sidebar">
            <div className="d3-brand">
              <div className="d3-brand-icon"/>
              <span>Optivise</span>
            </div>
            {['Dashboard','AI Insights','Products','A/B Tests','Analytics','Assistant'].map((item,i)=>(
              <div key={i} className={`d3-nav ${i===0?'d3-nav-active':''}`}>
                <div className="d3-nav-dot" style={{opacity: i===0?1:0.3}}/>
                {item}
              </div>
            ))}
            <div className="d3-sidebar-footer">
              <div className="d3-avatar">VC</div>
              <div>
                <div style={{fontSize:9,fontWeight:700,color:'#E2E8F0'}}>Varun Kumar</div>
                <div style={{fontSize:8,color:'#4A5568'}}>Store Owner</div>
              </div>
            </div>
          </div>
          {/* Main */}
          <div className="d3-main">
            <div className="d3-topbar">
              <span className="d3-greeting">Good morning, Varun! 👋</span>
              <div className="d3-topbar-right">
                <div className="d3-search"/>
                <div className="d3-notif"><div className="d3-notif-dot"/></div>
                <div className="d3-new-btn">+ New</div>
              </div>
            </div>
            {/* Metrics */}
            <div className="d3-metrics">
              {[
                {l:'Total Revenue',v:'$24,530',d:'↑ 26.5%',c:'#818CF8',bg:'rgba(99,102,241,0.1)'},
                {l:'Conversion',   v:'3.67%',  d:'↑ 8.2%', c:'#22D3EE',bg:'rgba(6,182,212,0.1)'},
                {l:'AI Score',     v:'78/100', d:'Great',   c:'#34D399',bg:'rgba(16,185,129,0.1)'},
                {l:'Suggestions',  v:'12 new', d:'High ↑',  c:'#FCD34D',bg:'rgba(245,158,11,0.1)'},
              ].map((m,i)=>(
                <div key={i} className="d3-metric" style={{background:m.bg,borderColor:m.c+'33'}}>
                  <div className="d3-metric-label">{m.l}</div>
                  <div className="d3-metric-val" style={{color:m.c}}>{m.v}</div>
                  <div className="d3-metric-delta">{m.d}</div>
                  {/* Mini sparkline */}
                  <svg viewBox="0 0 50 16" style={{width:'100%',height:16,marginTop:4}}>
                    <polyline points={`0,14 10,10 20,${12-i*2} 30,${8-i} 40,${6+i} 50,${4-i}`}
                      fill="none" stroke={m.c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
                  </svg>
                </div>
              ))}
            </div>
            {/* Chart */}
            <div className="d3-chart">
              <div className="d3-chart-hdr">
                <span style={{fontSize:9,fontWeight:700,color:'#94A3B8'}}>Performance Overview</span>
                <div style={{display:'flex',gap:8}}>
                  {[['#6366F1','Revenue'],['#06B6D4','Conv.'],['#F59E0B','Sessions']].map(([c,l])=>(
                    <div key={l} style={{display:'flex',alignItems:'center',gap:3,fontSize:8,color:'#4A5568'}}>
                      <div style={{width:6,height:6,borderRadius:2,background:c}}/>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
              <svg viewBox="0 0 300 55" preserveAspectRatio="none" style={{width:'100%',height:55}}>
                <defs>
                  {[['ga','#6366F1'],['gb','#06B6D4'],['gc','#F59E0B']].map(([id,c])=>(
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity="0.3"/>
                      <stop offset="100%" stopColor={c} stopOpacity="0"/>
                    </linearGradient>
                  ))}
                </defs>
                <path d="M0,48 C40,42 70,30 110,24 C150,18 170,35 210,16 C250,0 270,8 300,4 L300,55 L0,55Z" fill="url(#ga)"/>
                <path d="M0,48 C40,42 70,30 110,24 C150,18 170,35 210,16 C250,0 270,8 300,4" fill="none" stroke="#6366F1" strokeWidth="1.5"/>
                <path d="M0,52 C50,48 80,42 120,38 C160,34 190,44 230,32 C265,22 280,28 300,22 L300,55 L0,55Z" fill="url(#gb)"/>
                <path d="M0,52 C50,48 80,42 120,38 C160,34 190,44 230,32 C265,22 280,28 300,22" fill="none" stroke="#06B6D4" strokeWidth="1.5"/>
                <path d="M0,50 C60,46 90,38 130,35 C165,32 195,40 235,28 C270,18 285,24 300,18 L300,55 L0,55Z" fill="url(#gc)" opacity="0.5"/>
                <path d="M0,50 C60,46 90,38 130,35 C165,32 195,40 235,28 C270,18 285,24 300,18" fill="none" stroke="#F59E0B" strokeWidth="1"/>
              </svg>
            </div>
            {/* AI strip */}
            <div className="d3-ai-strip">
              <div className="d3-ai-dot"/>
              <span style={{fontSize:9,color:'#818CF8',fontWeight:700}}>AI</span>
              <span style={{fontSize:9,color:'#64748B',flex:1}}>3 products need description optimization — High Impact</span>
              <span style={{fontSize:9,color:'#6366F1',fontWeight:700}}>Fix now →</span>
            </div>
          </div>
        </div>
        {/* Shine layer */}
        <div className="d3-shine"/>
      </div>
      {/* Floating badges */}
      <div className="d3-badge d3-badge-1">
        <div className="d3-badge-pulse"/>
        <span>✨ AI generating...</span>
      </div>
      <div className="d3-badge d3-badge-2">
        <span>📈 +26% Revenue</span>
      </div>
      <div className="d3-badge d3-badge-3">
        <span>🎯 A/B Test Live</span>
      </div>
    </div>
  )
}

// ── Feature card with 3D tilt ─────────────────────────────────────────────────
const FEATURES = [
  { icon: '⚡', title: 'AI Description Generator', desc: 'Generate converting product descriptions in seconds. 5 tones. Save directly to Shopify.', color: '#818CF8' },
  { icon: '📊', title: 'Real Store Analytics',     desc: 'Live revenue, orders, and growth trends pulled directly from your Shopify store.',       color: '#22D3EE' },
  { icon: '🧪', title: 'A/B Testing',              desc: 'Test headlines, images, and pricing. Let real data decide what converts.',                color: '#34D399' },
  { icon: '🤖', title: 'AI Growth Assistant',      desc: 'Ask your store anything. "Why did sales drop?" Get answers backed by real data.',         color: '#FCD34D' },
  { icon: '🎯', title: 'Smart Recommendations',    desc: 'AI surfaces the highest-impact actions ranked by revenue potential every day.',           color: '#F472B6' },
  { icon: '🚀', title: 'Bulk Optimization',        desc: 'Optimize all product descriptions at once. Hours of work done in 2 minutes.',             color: '#FB923C' },
]

const STATS = [
  { end: 500,  suffix: '+',  label: 'Shopify Stores' },
  { end: 2400000, prefix: '$', suffix: '+', label: 'Revenue Optimized' },
  { end: 18,   suffix: '%',  label: 'Avg Conversion Lift' },
  { end: 4.9,  suffix: '★',  label: 'Average Rating' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.',  role: 'Jewelry Store Owner', text: 'Generated descriptions for 40 products in 3 minutes. Conversion jumped 18% in the first week.', avatar: 'SK', color: '#818CF8' },
  { name: 'Marcus T.', role: 'Apparel Brand',        text: 'Finally an analytics tool for small stores. I can understand my data without an MBA.',           avatar: 'MT', color: '#22D3EE' },
  { name: 'Priya M.',  role: 'Home Decor Shop',      text: 'The A/B testing alone is worth it. Found out my pricing page was killing conversions.',           avatar: 'PM', color: '#34D399' },
]

const FAQS = [
  { q: 'Do I need a credit card to start?',       a: 'No. The free plan is free forever — no card required. Upgrade only when you need more.' },
  { q: 'Does it work with my Shopify store?',     a: 'Yes. Connects directly via Shopify API. Setup takes under 5 minutes.' },
  { q: 'How many products can I optimize?',       a: 'Free: 10 products. Starter: unlimited. Growth: unlimited + bulk generation.' },
  { q: 'What AI model powers the descriptions?',  a: 'GPT-4o — the most capable model for high-quality, conversion-focused copy.' },
  { q: 'Can I cancel anytime?',                   a: 'Yes. No contracts, no lock-in. Cancel from your dashboard in one click.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [faqOpen, setFaqOpen] = useState(null)
  const mouse = useMouse()
  const heroTextRef = useRef(null)

  // Parallax hero text
  useEffect(() => {
    const el = heroTextRef.current; if (!el) return
    let raf
    const animate = () => {
      const { nx, ny } = mouse.current
      el.style.transform = `translate(${nx * 8}px, ${ny * 6}px)`
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="land">
      <CursorTrail />
      <FloatingOrbs />

      {/* ── NAV ── */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="land-logo logo-hover-wrap" style={{ position: 'relative', cursor: 'pointer' }}>
            <OptiviseLogo size={42} showText={true} textSize={16} />
            <div className="logo-hover-card">
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white', marginBottom: 8 }}>🚀 Optivise</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { icon: '✨', text: 'AI product descriptions' },
                  { icon: '📊', text: 'Real store analytics' },
                  { icon: '🎯', text: 'Growth recommendations' },
                  { icon: '🧪', text: 'A/B testing' },
                  { icon: '💬', text: 'AI assistant' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: '#96BF48', fontWeight: 700 }}>
                🆓 Free to try → optiviseai.io
              </div>
            </div>
          </div>
          <div className="land-nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="land-nav-cta">
            <MagneticBtn className="land-btn-ghost" onClick={() => navigate('/login')}>Log in</MagneticBtn>
            <MagneticBtn className="land-btn-primary" onClick={() => navigate('/register')}>Start free →</MagneticBtn>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="land-hero">
        <div className="land-hero-content" ref={heroTextRef}>
          <div className="land-badge hero-anim" style={{animationDelay:'0s'}}>
            <span className="land-badge-dot"/> 🚀 Free forever · No credit card
          </div>
          <h1 className="land-h1 hero-anim" style={{animationDelay:'0.1s'}}>
            The AI growth platform<br/>
            <span className="land-h1-accent">small Shopify stores</span><br/>
            actually can afford
          </h1>
          <p className="land-hero-sub hero-anim" style={{animationDelay:'0.2s'}}>
            Enterprise-level analytics, AI product descriptions, and A/B testing —
            at a price that won't eat your margins. Built for stores doing $1k–$50k/month.
          </p>
          <div className="land-hero-cta hero-anim" style={{animationDelay:'0.3s'}}>
            <MagneticBtn className="land-btn-hero" onClick={() => navigate('/register')}>
              <span className="land-btn-hero-text">Start for free — no card needed</span>
              <span className="land-btn-hero-arrow">→</span>
            </MagneticBtn>
            <div className="land-hero-proof">
              <div className="land-avatars">
                {['SK','MT','PM','JL','RK'].map(i => (
                  <div key={i} className="land-avatar">{i}</div>
                ))}
              </div>
              <span>500+ store owners already inside</span>
            </div>
          </div>
        </div>
        <div className="land-hero-3d hero-anim" style={{animationDelay:'0.2s'}}>
          <Dashboard3D />
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="land-stats-bar">
        {STATS.map((s,i) => (
          <div key={i} className="land-stat-item">
            <div className="land-stat-val">
              <Counter end={s.end} prefix={s.prefix||''} suffix={s.suffix}/>
            </div>
            <div className="land-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section className="land-section" id="features">
        <div className="land-section-header">
          <div className="land-section-tag">Features</div>
          <h2 className="land-h2">Everything your store needs to grow</h2>
          <p className="land-section-sub">All the tools $1M stores use — in one dashboard, at a fraction of the cost.</p>
        </div>
        <div className="land-features-grid">
          {FEATURES.map((f, i) => (
            <TiltCard key={i} className="land-feature-card">
              <div className="land-feature-glow" style={{background: f.color + '22'}}/>
              <div className="land-feature-icon" style={{fontSize:28}}>{f.icon}</div>
              <div className="land-feature-title" style={{color: f.color}}>{f.title}</div>
              <div className="land-feature-desc">{f.desc}</div>
              <div className="land-feature-shine"/>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="land-section">
        <div className="land-section-header">
          <div className="land-section-tag">Love</div>
          <h2 className="land-h2">Store owners love Optivise</h2>
        </div>
        <div className="land-testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <TiltCard key={i} className="land-testi-card">
              <div className="land-stars">★★★★★</div>
              <p className="land-testi-text">"{t.text}"</p>
              <div className="land-testi-author">
                <div className="land-testi-avatar" style={{background:`linear-gradient(135deg,${t.color},${t.color}88)`}}>{t.avatar}</div>
                <div>
                  <div className="land-testi-name">{t.name}</div>
                  <div className="land-testi-role">{t.role}</div>
                </div>
              </div>
              <div className="land-feature-shine"/>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="land-section" id="pricing">
        <div className="land-section-header">
          <div className="land-section-tag">Pricing</div>
          <h2 className="land-h2">Start free. Upgrade when ready.</h2>
          <p className="land-section-sub">No credit card. No contracts. Cancel anytime.</p>
        </div>
        <div className="land-pricing-grid">
          {[
            { name:'Free', price:'$0', desc:'Perfect start', features:['10 products','50 AI credits/mo','Basic analytics','Recommendations','Community support'], cta:'Get started free', featured:false },
            { name:'Starter', price:'$29', desc:'For growing stores', features:['Unlimited products','500 AI credits/mo','Full analytics','A/B testing (3 tests)','AI assistant','Email support'], cta:'Start free trial', featured:false },
            { name:'Growth', price:'$79', desc:'For serious owners', features:['Everything in Starter','Unlimited AI credits','Bulk description generator','Unlimited A/B tests','Priority AI assistant','Priority support'], cta:'Start free trial', featured:true },
          ].map((plan,i) => (
            <TiltCard key={i} className={`land-price-card ${plan.featured ? 'land-price-featured' : ''}`} intensity={0.6}>
              {plan.featured && <div className="land-price-popular">Most Popular</div>}
              <div className="land-price-name">{plan.name}</div>
              <div className="land-price-amount">{plan.price}<span>/mo</span></div>
              <div className="land-price-desc">{plan.desc}</div>
              <ul className="land-price-features">
                {plan.features.map((f,j) => <li key={j}><span className="chk">✓</span>{f}</li>)}
              </ul>
              <MagneticBtn
                className={plan.featured ? 'land-btn-price-primary' : 'land-btn-price-ghost'}
                onClick={() => navigate('/register')}>
                {plan.cta} →
              </MagneticBtn>
              <div className="land-feature-shine"/>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="land-section" id="faq">
        <div className="land-section-header">
          <div className="land-section-tag">FAQ</div>
          <h2 className="land-h2">Common questions</h2>
        </div>
        <div className="land-faq">
          {FAQS.map((f, i) => (
            <div key={i} className={`land-faq-item ${faqOpen===i?'open':''}`} onClick={() => setFaqOpen(faqOpen===i?null:i)}>
              <div className="land-faq-q"><span>{f.q}</span><span className="land-faq-arrow">{faqOpen===i?'−':'+'}</span></div>
              {faqOpen===i && <div className="land-faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="land-final-cta">
        <div className="land-final-glow"/>
        <div className="land-section-tag" style={{marginBottom:20}}>Get Started</div>
        <h2 className="land-h2" style={{marginBottom:16}}>Ready to grow your store?</h2>
        <p style={{color:'#64748B',marginBottom:36,fontSize:16,maxWidth:480,margin:'0 auto 36px'}}>
          Join 500+ Shopify store owners. Free forever, no card needed.
        </p>
        <MagneticBtn className="land-btn-hero land-btn-hero-lg" onClick={() => navigate('/register')}>
          Start for free — takes 2 minutes →
        </MagneticBtn>
      </section>

      {/* ── FOOTER ── */}
      <footer className="land-footer">
        <div className="land-logo" style={{marginBottom:8}}>
          <OptiviseLogo size={32} showText={true} textSize={14} />
        </div>
        <div style={{fontSize:12,color:'#2D3748',display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'center'}}>
          <span>© 2026 Optivise</span>
          <span>·</span>
          <a href="/privacy" style={{color:'#334155',textDecoration:'none'}} onMouseEnter={e=>e.target.style.color='#818CF8'} onMouseLeave={e=>e.target.style.color='#334155'}>Privacy Policy</a>
          <span>·</span>
          <a href="/terms" style={{color:'#334155',textDecoration:'none'}} onMouseEnter={e=>e.target.style.color='#818CF8'} onMouseLeave={e=>e.target.style.color='#334155'}>Terms of Service</a>
          <span>·</span>
          <span>Made with ❤️ by Varun Kumar Konnoju</span>
        </div>
      </footer>
    </div>
  )
}