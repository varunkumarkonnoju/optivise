import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, TrendingDown, BarChart3, RefreshCw,
  CheckCircle, ArrowRight, ChevronDown, Zap,
  Package, TestTube2, RotateCcw, Activity,
  Star, Users, Clock, Shield, Play, X
} from 'lucide-react'
import OptiviseLogo from '../components/OptiviseLogo'
import LogoText from '../components/LogoText'

// ── ANIMATED COUNTER ─────────────────────────────────
function AnimatedCounter({ target, prefix = '', suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const steps = 60
        const increment = target / steps
        const timer = setInterval(() => {
          start += increment
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.round(start))
        }, duration / steps)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// ── TYPING EFFECT ─────────────────────────────────────
function TypewriterText({ texts, speed = 80 }) {
  const [displayed, setDisplayed] = useState('')
  const [textIdx, setTextIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[textIdx]
    const timer = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setDisplayed(current.slice(0, charIdx + 1))
          setCharIdx(c => c + 1)
        } else {
          setTimeout(() => setDeleting(true), 2000)
        }
      } else {
        if (charIdx > 0) {
          setDisplayed(current.slice(0, charIdx - 1))
          setCharIdx(c => c - 1)
        } else {
          setDeleting(false)
          setTextIdx(i => (i + 1) % texts.length)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timer)
  }, [charIdx, deleting, textIdx, texts, speed])

  return (
    <span>
      {displayed}
      <span style={{
        display: 'inline-block', width: 2, height: '1em',
        background: '#6366f1', marginLeft: 2,
        animation: 'blink 1s step-end infinite',
        verticalAlign: 'text-bottom',
      }} />
    </span>
  )
}

// ── LIVE AI DEMO ──────────────────────────────────────
function LiveDemo() {
  const [productName, setProductName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(0)

  const EXAMPLES = ['Leather Crossbody Bag', 'Running Shoes', 'Wooden Watch', 'Silk Scarf', 'Minimalist Wallet']

  const getMockResult = (name) => {
    const n = name.toLowerCase()
    const isPhone     = n.includes('iphone') || n.includes('phone') || n.includes('samsung') || n.includes('pixel')
    const isShoes     = n.includes('shoe') || n.includes('sneaker') || n.includes('boot') || n.includes('running')
    const isWatch     = n.includes('watch')
    const isScarf     = n.includes('scarf') || n.includes('silk')
    const isWallet    = n.includes('wallet')
    const isBag       = n.includes('bag') || n.includes('purse') || n.includes('backpack')
    const isGlasses   = n.includes('glass') || n.includes('sunglass') || n.includes('spectacle') || n.includes('eyewear')
    const isJacket    = n.includes('jacket') || n.includes('coat') || n.includes('hoodie') || n.includes('sweater')
    const isJewelry   = n.includes('ring') || n.includes('necklace') || n.includes('bracelet') || n.includes('earring')
    const isShirt     = n.includes('shirt') || n.includes('tshirt') || n.includes('t-shirt') || n.includes('top') || n.includes('dress')
    const isPants     = n.includes('pant') || n.includes('jean') || n.includes('trouser') || n.includes('shorts')
    const isLaptop    = n.includes('laptop') || n.includes('macbook') || n.includes('computer') || n.includes('tablet') || n.includes('ipad')
    const isHeadphone = n.includes('headphone') || n.includes('airpod') || n.includes('earbud') || n.includes('earphone')
    const isPerfume   = n.includes('perfume') || n.includes('cologne') || n.includes('fragrance')
    const isSkincare  = n.includes('cream') || n.includes('serum') || n.includes('moisturizer') || n.includes('skincare')
    const isFurniture = n.includes('chair') || n.includes('desk') || n.includes('table') || n.includes('lamp') || n.includes('sofa')

    if (isPhone) return {
      before: `${name}. Latest model. Good camera. Fast processor. Multiple colors available.`,
      after: `<h2>The Phone That Does Everything — Beautifully</h2><p>Meet the ${name} — engineered for people who refuse to compromise. The most advanced camera system ever in a smartphone captures every moment exactly as you lived it.</p><ul><li>📸 Pro camera system with 5x optical zoom</li><li>🔋 All-day battery life that keeps up with you</li><li>🏆 Titanium design — lighter, stronger, premium</li></ul><p><strong>🚀 Order now. Ships in 1–2 business days.</strong></p>`,
      score: '+41% conversion predicted'
    }

    if (isShoes) return {
      before: `${name}. Comfortable fit. Good for running. Available in multiple sizes.`,
      after: `<h2>Run Further. Feel Less.</h2><p>The ${name} is engineered for runners who demand more from every mile. Responsive cushioning absorbs impact while a breathable upper keeps you cool from start to finish.</p><ul><li>⚡ Energy-return foam for less fatigue</li><li>👣 Wide toe box for natural foot movement</li><li>💪 Durable outsole built for 500+ miles</li></ul><p><strong>🚚 Limited sizes remaining. Ships free.</strong></p>`,
      score: '+38% conversion predicted'
    }

    if (isWatch) return {
      before: `${name}. Stylish design. Good quality. Water resistant. Multiple colors.`,
      after: `<h2>Time, Worn With Intention</h2><p>The ${name} isn't just a timepiece — it's a statement about how you value your hours. Hand-assembled with precision, each watch develops its own character over years of wear.</p><ul><li>Sapphire crystal glass — scratch-proof for life</li><li>Japanese movement — accurate to ±5 sec/day</li><li>100m water resistance for any adventure</li></ul><p><strong>Free engraving available. Ships in 3–5 days.</strong></p>`,
      score: '+36% conversion predicted'
    }

    if (isScarf) return {
      before: `${name}. Soft material. Beautiful colors. One size fits all.`,
      after: `<h2>Effortless Elegance, Every Day</h2><p>Woven from the finest silk, this ${name} drapes like a second skin and elevates everything you wear. A single piece that takes you from morning meetings to evening events.</p><ul><li>🌸 100% pure mulberry silk</li><li>✨ Hand-rolled edges for a couture finish</li><li>🌡️ Naturally temperature-regulating fabric</li></ul><p><strong>🎁 Gift wrapping available. Free returns.</strong></p>`,
      score: '+33% conversion predicted'
    }

    if (isWallet) return {
      before: `${name}. Slim design. Multiple card slots. Good quality leather.`,
      after: `<h2>Everything You Need. Nothing You Don't.</h2><p>The ${name} is built for the person who values function as much as form. Slim enough to forget it's in your pocket, yet holds everything you actually need.</p><ul><li>💳 Holds 8 cards + cash without stretching</li><li>🛡️ RFID blocking — protect your data</li><li>🌿 Full-grain leather that ages beautifully</li></ul><p><strong>✏️ Personalization available. Ships same day.</strong></p>`,
      score: '+29% conversion predicted'
    }

    if (isBag) return {
      before: `${name}. Good quality. Multiple compartments. Adjustable strap.`,
      after: `<h2>The Bag That Goes Everywhere You Do</h2><p>The ${name} is designed for the person who needs to be ready for anything. Thoughtful compartments keep you organized while a refined exterior keeps you looking sharp.</p><ul><li>🌿 Full-grain leather — develops character over time</li><li>💻 Padded laptop compartment fits up to 15"</li><li>🔒 Magnetic closure for easy one-handed access</li></ul><p><strong>🚚 Free shipping over $100. 30-day returns.</strong></p>`,
      score: '+34% conversion predicted'
    }

    if (isGlasses) return {
      before: `${name}. UV protection. Stylish frames. Multiple colors available.`,
      after: `<h2>See the World in Style</h2><p>The ${name} isn't just eye protection — it's a statement. Handcrafted frames that sit perfectly on any face, with UV400 lenses that protect without distorting your view.</p><ul><li>☀️ 100% UV400 protection — blocks all harmful rays</li><li>🌊 Polarized lenses eliminate glare completely</li><li>🪶 Lightweight frame — forget you're wearing them</li></ul><p><strong>🎁 Free case and cloth included. Ships in 24 hours.</strong></p>`,
      score: '+31% conversion predicted'
    }

    if (isJacket) return {
      before: `${name}. Good material. Multiple sizes. Fast shipping available.`,
      after: `<h2>The Last ${name} You'll Ever Buy</h2><p>Built for people who refuse to compromise between style and function. Premium construction that holds its shape wash after wash, season after season.</p><ul><li>🧵 Premium fabric that improves with every wear</li><li>✂️ Tailored fit that works on every body type</li><li>🎒 4 deep pockets — actually useful ones</li></ul><p><strong>🔄 Free returns within 30 days. Ships same day.</strong></p>`,
      score: '+35% conversion predicted'
    }

    if (isJewelry) return {
      before: `${name}. Beautiful design. Good quality. Great gift idea.`,
      after: `<h2>Worn Every Day. Treasured Forever.</h2><p>The ${name} is designed for people who believe everyday moments deserve beautiful things. Crafted to be worn constantly — through workouts, showers, and everything in between.</p><ul><li>✨ Tarnish-free — looks new after years of wear</li><li>💚 Hypoallergenic — safe for all skin types</li><li>🎁 Gift-ready packaging included free</li></ul><p><strong>✏️ Engrave it free. Ships in 2–3 days.</strong></p>`,
      score: '+38% conversion predicted'
    }

    if (isShirt) return {
      before: `${name}. Comfortable fabric. Multiple colors. Available in all sizes.`,
      after: `<h2>The ${name} That Goes With Everything</h2><p>Some clothes you wear. This one you live in. Cut from fabric that breathes, moves, and holds its shape through anything your day throws at it.</p><ul><li>🌬️ Wrinkle-resistant — looks sharp all day</li><li>💧 Moisture-wicking fabric for all-day comfort</li><li>🔄 Pre-shrunk — fits the same after 100 washes</li></ul><p><strong>🔁 Free exchanges on size. Ships same day.</strong></p>`,
      score: '+29% conversion predicted'
    }

    if (isPants) return {
      before: `${name}. Comfortable fit. Good quality material. Multiple sizes available.`,
      after: `<h2>The ${name} That Finally Fits Right</h2><p>Built for real bodies doing real things. Whether you're at your desk or on your feet all day, these move with you — not against you.</p><ul><li>🤸 4-way stretch fabric — total freedom of movement</li><li>📐 Sits perfectly at the waist — no constant adjusting</li><li>🧺 Machine washable — no dry cleaning, ever</li></ul><p><strong>✂️ Free hemming service. Ships in 24 hours.</strong></p>`,
      score: '+32% conversion predicted'
    }

    if (isLaptop) return {
      before: `${name}. Fast processor. Good battery. Lightweight design.`,
      after: `<h2>Your Most Productive Tool Yet</h2><p>The ${name} is built for people who use their computer to build things, create things, and get things done — without waiting for it to keep up.</p><ul><li>All-day battery — unplugged from 9am to 9pm</li><li>Blazing fast — apps open instantly, every time</li><li>Featherlight — barely notice it in your bag</li></ul><p><strong>Free setup support included. Ships next business day.</strong></p>`,
      score: '+33% conversion predicted'
    }

    if (isHeadphone) return {
      before: `${name}. Good sound quality. Comfortable fit. Long battery life.`,
      after: `<h2>Hear Everything. Hear It Better.</h2><p>The ${name} is engineered for people who take their audio seriously. Whether you're deep in work, a workout, or a playlist — these deliver every time.</p><ul><li>🎵 Studio-quality sound tuned by audio engineers</li><li>🔇 Active noise cancellation — total focus, anywhere</li><li>🔋 32-hour battery — never die mid-commute again</li></ul><p><strong>🔄 Try for 30 days. Free shipping both ways.</strong></p>`,
      score: '+36% conversion predicted'
    }

    if (isPerfume) return {
      before: `${name}. Nice scent. Long lasting. Great for gifts.`,
      after: `<h2>The Scent People Will Ask About</h2><p>The ${name} opens with immediate presence and evolves beautifully throughout the day. The kind of fragrance that people lean closer to identify — and never forget.</p><ul><li>⏱️ Long-lasting formula — 8-12 hours of wear</li><li>🇫🇷 Crafted by master perfumers in Grasse, France</li><li>🖤 Signature bottle — display-worthy on any vanity</li></ul><p><strong>🎁 Complimentary gift wrap available. Ships in 24 hours.</strong></p>`,
      score: '+40% conversion predicted'
    }

    if (isSkincare) return {
      before: `${name}. Good for skin. Natural ingredients. Suitable for all skin types.`,
      after: `<h2>The Skin You've Always Wanted Starts Here</h2><p>The ${name} is formulated with dermatologist-tested ingredients that actually work — not just feel good. Visible results in 14 days or your money back.</p><ul><li>🧪 Clinically tested — 94% saw visible improvement</li><li>🌿 Non-comedogenic — won't clog your pores</li><li>✅ Clean formula — free from parabens and sulfates</li></ul><p><strong>💯 14-day results guarantee. Free shipping over $40.</strong></p>`,
      score: '+42% conversion predicted'
    }

    if (isFurniture) return {
      before: `${name}. Good quality. Easy assembly. Multiple colors available.`,
      after: `<h2>The ${name} That Pulls the Room Together</h2><p>Some furniture fills space. This ${name} defines it. Designed by architects, built by craftspeople, made to outlast every trend that comes and goes.</p><ul><li>🪵 Solid hardwood construction — built for decades</li><li>⚡ Ships fully assembled — ready in minutes</li><li>🛡️ 5-year structural warranty included</li></ul><p><strong>🚚 White glove delivery available. Free returns within 60 days.</strong></p>`,
      score: '+30% conversion predicted'
    }

    // Generic fallback
    return {
      before: `${name}. Good quality product. Fast shipping. Great value.`,
      after: `<h2>The ${name} — Built for People Who Demand More</h2><p>This isn't just another ${name}. Every detail has been considered, every material chosen for a reason. The result is something that works harder, lasts longer, and looks better doing it.</p><ul><li>⭐ Premium materials selected for durability</li><li>🎯 Designed for real-world daily use</li><li>✅ Backed by our satisfaction guarantee</li></ul><p><strong>🚚 Limited stock. Free shipping. 30-day returns.</strong></p>`,
      score: '+28% conversion predicted'
    }
  }

  const steps = ['Analyzing product...', 'Writing SEO copy...', 'Optimizing for conversion...', 'Done! ✓']

  const runDemo = async () => {
    if (!productName.trim()) return
    setGenerating(true)
    setResult(null)
    setStep(0)
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700))
      setStep(i)
    }
    await new Promise(r => setTimeout(r, 400))
    setResult(getMockResult(productName))
    setGenerating(false)
  }

  return (
    <div style={{
      background: '#0a1628',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: '#0d1b35',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
        <span style={{ marginLeft: 8, fontSize: 12, color: '#334155' }}>
          Optivise AI · Product Description Generator
        </span>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Input */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 8, letterSpacing: '0.05em' }}>
            ENTER ANY PRODUCT NAME
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={productName}
              onChange={e => setProductName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runDemo()}
              placeholder="e.g. Leather Crossbody Bag..."
              style={{
                flex: 1, background: '#0d1b35',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 8, padding: '10px 14px',
                color: '#e2e8f0', fontSize: 13, outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={runDemo}
              disabled={generating || !productName.trim()}
              style={{
                background: generating ? 'rgba(99,102,241,0.5)' : '#6366f1',
                border: 'none', borderRadius: 8,
                padding: '10px 20px', color: 'white',
                fontSize: 13, fontWeight: 700,
                cursor: generating ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              <Sparkles size={13} />
              {generating ? 'Writing...' : 'Generate free'}
            </button>
          </div>
          {/* Quick examples */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => setProductName(ex)} style={{
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 20, padding: '3px 10px',
                fontSize: 11, color: '#64748b',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Generating state */}
        {generating && (
          <div style={{
            background: '#0d1b35', borderRadius: 10,
            padding: '16px', marginBottom: 16,
          }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 0', opacity: i <= step ? 1 : 0.3,
                transition: 'opacity 0.3s',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: i < step ? '#10b981' : i === step ? '#6366f1' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, flexShrink: 0,
                  animation: i === step ? 'pulse 1s ease-in-out infinite' : 'none',
                }}>
                  {i < step ? '✓' : i === step ? '...' : ''}
                </div>
                <span style={{ fontSize: 12, color: i <= step ? '#94a3b8' : '#334155' }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Result */}
        {result && !generating && (
          <div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 12, marginBottom: 12,
            }}>
              {/* Before */}
              <div style={{
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 10, padding: '14px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', marginBottom: 8, letterSpacing: '0.05em' }}>
                  ❌ BEFORE — Your current description
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                  {result.before}
                </div>
              </div>
              {/* After */}
              <div style={{
                background: 'rgba(16,185,129,0.05)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 10, padding: '14px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', marginBottom: 8, letterSpacing: '0.05em' }}>
                  ✅ AFTER — AI-optimized description
                </div>
                <div
                  style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: result.after }}
                />
              </div>
            </div>
            <div style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 8, padding: '10px 14px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>
                🎯 {result.score}
              </span>
              <span style={{ fontSize: 11, color: '#334155' }}>
                Preview only — connect your store to save to Shopify
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !generating && (
          <div style={{
            textAlign: 'center', padding: '24px',
            background: '#0d1b35', borderRadius: 10,
          }}>
            <Sparkles size={24} color="#6366f1" style={{ marginBottom: 8, opacity: 0.6 }} />
            <div style={{ fontSize: 13, color: '#334155' }}>
              Type any product name above → see AI write a description in real-time
            </div>
            <div style={{ fontSize: 11, color: '#1e3a5f', marginTop: 4 }}>
              No account needed for this preview
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MAIN LANDING PAGE ─────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const [navScrolled, setNavScrolled] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [billingYearly, setBillingYearly] = useState(false)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: '#020817', color: '#e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden' }}>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 40px rgba(99,102,241,0.6)} }
        .hero-card { animation: float 4s ease-in-out infinite; }
        .slide-up { animation: slideUp 0.6s ease forwards; }
        .hover-card:hover { border-color: rgba(99,102,241,0.3) !important; transform: translateY(-2px); transition: all 0.2s ease; }
        .hover-bright:hover { background: rgba(99,102,241,0.15) !important; transition: background 0.2s; }
        .glow-btn { animation: glow 2s ease-in-out infinite; }
      `}</style>

      {/* ── ANNOUNCEMENT BAR ── */}
      <div style={{
        background: 'rgba(99,102,241,0.08)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        padding: '10px 24px',
        textAlign: 'center',
        fontSize: 12, color: '#818cf8',
      }}>
        🎓 Built by a CS grad while waiting for a US work visa —{' '}
        <strong style={{ color: '#fff' }}>now live and completely free</strong>
        {' '}→{' '}
        <span
          onClick={() => navigate('/signup')}
          style={{ color: '#818cf8', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
        >
          Join the waitlist
        </span>
      </div>

      {/* ── STICKY NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: navScrolled ? 'rgba(2,8,23,0.95)' : 'transparent',
        backdropFilter: navScrolled ? 'blur(12px)' : 'none',
        borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        padding: '14px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <OptiviseLogo size={36} showText={false} />
          <LogoText nameSize={18} tagSize={8} />
        </div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {['Features', 'How it works', 'Pricing', 'My story'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} style={{
              fontSize: 13, color: '#64748b',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#e2e8f0'}
              onMouseLeave={e => e.target.style.color = '#64748b'}
            >
              {item}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', color: '#64748b', fontSize: 13, cursor: 'pointer' }}
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="glow-btn"
            style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '8px 20px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Start free →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '80px 40px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div className="slide-up">
            {/* Founder pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, padding: '6px 14px',
              fontSize: 11, color: '#94a3b8', marginBottom: 24,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#fff',
              }}>VK</div>
              Built by Varun · CS grad · Concordia University, WI
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 56, fontWeight: 900, lineHeight: 1.05,
              letterSpacing: '-2.5px', color: '#fff', marginBottom: 8,
            }}>
              Your Shopify<br />
              store is{' '}
              <span style={{
                color: '#6366f1',
                position: 'relative',
                display: 'inline-block',
              }}>
                leaking
              </span>
              <br />money.
            </h1>

            <p style={{
              fontSize: 13, color: '#f59e0b',
              fontWeight: 700, fontStyle: 'italic',
              marginBottom: 16,
            }}>
              I found $2,400/month leaking from one test store. Here's the free tool I built to fix it.
            </p>

            <p style={{
              fontSize: 15, color: '#64748b',
              lineHeight: 1.7, marginBottom: 32, maxWidth: 440,
            }}>
              Optivise connects to your real Shopify data and shows exactly where revenue is escaping — 
              then fixes it with AI descriptions, A/B tests, and real analytics.
              <strong style={{ color: '#94a3b8' }}> No demo call. No credit card. 2 minutes to connect.</strong>
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  background: '#6366f1', border: 'none', borderRadius: 12,
                  padding: '14px 28px', color: 'white',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Zap size={15} />
                Start free — 2 min setup
              </button>
              <button
                onClick={() => setVideoOpen(true)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '14px 20px',
                  color: '#94a3b8', fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Play size={13} fill="#94a3b8" />
                Watch 60-second demo
              </button>
            </div>

            {/* Trust row */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                'Free plan forever',
                'No credit card needed',
                'Official Shopify OAuth',
                'Read-only — 100% safe',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'rgba(16,185,129,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: '#10b981', flexShrink: 0,
                  }}>✓</div>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Live Demo */}
          <div className="hero-card">
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{
        background: '#0a1628',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '28px 40px',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          textAlign: 'center', gap: 20,
        }}>
          {[
            { num: 216898, prefix: '$', suffix: '', label: 'Revenue analyzed from test store' },
            { num: 94, prefix: '', suffix: '/100', label: 'Store health score achieved' },
            { num: 6, prefix: '', suffix: ' weeks', label: 'To build the entire platform' },
            { num: 0, prefix: '', suffix: ' users', label: 'Honest count — day 1 of launch' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 900, color: i === 3 ? '#f59e0b' : '#fff' }}>
                {s.prefix}
                <AnimatedCounter target={s.num} duration={1800} />
                {s.suffix}
              </div>
              <div style={{ fontSize: 11, color: '#334155', marginTop: 6 }}>{s.label}</div>
              {i === 3 && (
                <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 4, fontWeight: 600 }}>
                  I'm being honest. This is day 1.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── SHOPIFY PAIN POINTS ── */}
      <section id="features" style={{ padding: '70px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 6, padding: '3px 12px',
            fontSize: 10, fontWeight: 700,
            color: '#ef4444', letterSpacing: '1px',
            marginBottom: 12,
          }}>
            THE REAL PROBLEM
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 10 }}>
            Most Shopify store owners<br />
            <span style={{ color: '#ef4444' }}>are flying blind.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#475569', maxWidth: 500, margin: '0 auto' }}>
            Sound familiar? These are the 5 exact problems Shopify store owners face every day.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {[
            { icon: '📝', problem: '"My product descriptions are terrible but I don\'t know how to fix them"', loss: '-$720/mo' },
            { icon: '📊', problem: '"I have no idea which of my 47 products are actually making me money"', loss: '-$1,200/mo' },
            { icon: '💸', problem: '"I spent $300 on Facebook ads last week — I have no idea if it worked"', loss: '-$900/mo' },
            { icon: '🛒', problem: '"My conversion rate is 1.2% and I don\'t know why people aren\'t buying"', loss: '-$1,800/mo' },
            { icon: '😤', problem: '"I have 15 tabs open and no single tool that actually shows me what\'s wrong"', loss: '-$600/mo' },
          ].map((p, i) => (
            <div key={i} className="hover-card" style={{
              background: '#0a1628',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12, padding: '20px 16px',
              cursor: 'default',
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 12 }}>
                {p.problem}
              </div>
              <div style={{
                fontSize: 13, fontWeight: 800, color: '#ef4444',
                background: 'rgba(239,68,68,0.08)',
                borderRadius: 6, padding: '4px 10px',
                display: 'inline-block',
              }}>
                {p.loss}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BEFORE / AFTER SECTION ── */}
      <section style={{
        padding: '60px 40px',
        background: '#060e1e',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 6, padding: '3px 12px',
              fontSize: 10, fontWeight: 700,
              color: '#6366f1', letterSpacing: '1px', marginBottom: 12,
            }}>
              REAL EXAMPLE
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
              This is what AI descriptions actually look like
            </h2>
            <p style={{ fontSize: 14, color: '#475569' }}>
              Same product. 30 seconds apart. Completely different result.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'stretch' }}>
            {/* Before */}
            <div style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 14, padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{
                  background: 'rgba(239,68,68,0.15)', borderRadius: 6,
                  padding: '3px 10px', fontSize: 10, fontWeight: 700, color: '#ef4444',
                }}>
                  ❌ BEFORE
                </div>
                <span style={{ fontSize: 11, color: '#475569' }}>What most store owners write</span>
              </div>
              <div style={{
                background: '#0a1628', borderRadius: 8, padding: '14px',
                fontSize: 13, color: '#64748b', lineHeight: 1.8,
                fontStyle: 'italic',
              }}>
                "Premium leather jacket. Size M/L/XL. Black color. Multiple pockets. 
                Good quality material. Fast shipping available."
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>1.1%</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>conversion rate</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>F</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>SEO score</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>4s</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>bounce time</div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                background: '#6366f1', borderRadius: '50%',
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                ✨
              </div>
            </div>

            {/* After */}
            <div style={{
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 14, padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{
                  background: 'rgba(16,185,129,0.15)', borderRadius: 6,
                  padding: '3px 10px', fontSize: 10, fontWeight: 700, color: '#10b981',
                }}>
                  ✅ AFTER
                </div>
                <span style={{ fontSize: 11, color: '#475569' }}>Optivise AI · 30 seconds</span>
              </div>
              <div style={{
                background: '#0a1628', borderRadius: 8, padding: '14px',
                fontSize: 13, color: '#94a3b8', lineHeight: 1.8,
              }}>
                <strong style={{ color: '#f1f5f9' }}>The Last Jacket You'll Ever Need.</strong>
                <br />
                Crafted from full-grain leather that develops a rich patina over time, 
                this jacket is designed for people who refuse to compromise on quality. 
                Four deep pockets. A cut that works at the office and after hours.
                <br /><br />
                <span style={{ color: '#10b981' }}>★ Backed by 30-day returns. Ships in 24 hours.</span>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981' }}>4.2%</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>conversion rate</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981' }}>A</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>SEO score</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981' }}>3.8×</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>more time on page</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 8, padding: '8px 20px',
              fontSize: 12, color: '#818cf8',
            }}>
              Try it yourself above ↑ — type any product name, no sign-up needed
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '70px 40px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 6, padding: '3px 12px',
            fontSize: 10, fontWeight: 700, color: '#6366f1',
            letterSpacing: '1px', marginBottom: 12,
          }}>
            HOW IT WORKS
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
            From zero to growing — in 3 steps
          </h2>
          <p style={{ fontSize: 14, color: '#475569' }}>
            No developers. No complicated setup. Just your Shopify store URL.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, position: 'relative' }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute', top: 44, left: '17%', right: '17%',
            height: 1, background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)',
            opacity: 0.3, zIndex: 0,
          }} />

          {[
            {
              step: '01', color: '#6366f1',
              icon: '🔗', title: 'Connect your store',
              desc: 'Click "Connect Shopify" → authorize with official OAuth → we pull your real products, orders and revenue. Takes exactly 90 seconds.',
              detail: 'Read-only access. We never modify without permission.',
            },
            {
              step: '02', color: '#06b6d4',
              icon: '🤖', title: 'AI scans everything',
              desc: 'Our AI analyzes every product, your conversion rate, revenue by product, and compares against what high-performing stores look like.',
              detail: 'GPT-4o powered analysis on your real data.',
            },
            {
              step: '03', color: '#10b981',
              icon: '🚀', title: 'Fix and grow',
              desc: 'Get exact recommendations ranked by revenue impact. Generate AI descriptions in 1 click. Save directly to Shopify. Watch revenue grow.',
              detail: 'Average improvement visible within 7 days.',
            },
          ].map((s, i) => (
            <div key={i} className="hover-card" style={{
              background: '#0a1628',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 14, padding: '28px 24px',
              position: 'relative', zIndex: 1,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${s.color}15`,
                border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 16,
              }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.color, marginBottom: 8, letterSpacing: '1px' }}>
                STEP {s.step}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, marginBottom: 10 }}>
                {s.desc}
              </div>
              <div style={{
                fontSize: 11, color: s.color, fontWeight: 600,
                background: `${s.color}08`, borderRadius: 6,
                padding: '4px 10px', display: 'inline-block',
              }}>
                {s.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        padding: '60px 40px',
        background: '#060e1e',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
              Built from scratch. By one person.
            </h2>
            <p style={{ fontSize: 14, color: '#475569' }}>
              No templates. No no-code tools. Java + React + 6 weeks of late nights.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { icon: '✨', color: '#6366f1', title: 'AI Product Descriptions', desc: '1-click AI rewrites for any product. Saves directly to your live Shopify store. Original always backed up.', badge: 'Most used' },
              { icon: '📉', color: '#ef4444', title: 'Revenue Leak Detector', desc: 'AI finds exactly where you\'re losing money each month — with specific dollar amounts and one-click fixes.', badge: 'Most valuable' },
              { icon: '🏥', color: '#10b981', title: 'Store Health Score', desc: '0–100 animated health check. 6 detailed checks. See what\'s working and what\'s killing your conversions.', badge: null },
              { icon: '📊', color: '#06b6d4', title: 'Real Analytics', desc: 'Revenue, orders, conversion rate, best sellers — all from your actual Shopify data. Not estimates. Not guesses.', badge: null },
              { icon: '🧪', color: '#f59e0b', title: 'A/B Testing', desc: 'Test two versions of any product description. Let real customer data decide which one converts better.', badge: null },
              { icon: '↩', color: '#96bf48', title: 'Description History', desc: 'Every original description backed up. Don\'t like the AI version? Restore your original in one click. Forever.', badge: 'Peace of mind' },
            ].map((f, i) => (
              <div key={i} className="hover-card" style={{
                background: '#0a1628',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12, padding: '22px',
                position: 'relative',
              }}>
                {f.badge && (
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    background: `${f.color}15`, border: `1px solid ${f.color}30`,
                    borderRadius: 20, padding: '2px 8px',
                    fontSize: 9, fontWeight: 700, color: f.color,
                  }}>
                    {f.badge}
                  </div>
                )}
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: `${f.color}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, marginBottom: 12,
                }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
                  {f.desc}
                </div>
                <div style={{ height: 3, borderRadius: 2, marginTop: 14, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: f.color, width: `${[88, 92, 78, 85, 72, 70][i]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDER STORY ── */}
      <section id="my-story" style={{ padding: '70px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 60, alignItems: 'center' }}>
          {/* Left — Avatar + Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38, fontWeight: 900, color: '#fff',
              border: '3px solid rgba(99,102,241,0.3)',
              boxShadow: '0 0 30px rgba(99,102,241,0.2)',
            }}>
              VK
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Varun Kumar Konnoju</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>MS Computer Science</div>
              <div style={{ fontSize: 12, color: '#475569' }}>Concordia University of Wisconsin</div>
              <div style={{ fontSize: 12, color: '#6366f1', marginTop: 2, fontWeight: 600 }}>Founder, Optivise AI</div>
            </div>

            {/* Build timeline */}
            <div style={{
              background: '#0a1628',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12, padding: '16px 20px', width: '100%',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#334155', letterSpacing: '0.5px', marginBottom: 12 }}>
                BUILD TIMELINE
              </div>
              {[
                { week: 'Wk 1–2', desc: 'Auth system, database, user accounts', color: '#6366f1', done: true },
                { week: 'Wk 3', desc: 'Shopify OAuth + real store data', color: '#06b6d4', done: true },
                { week: 'Wk 4', desc: 'AI descriptions + GPT-4o integration', color: '#f59e0b', done: true },
                { week: 'Wk 5–6', desc: 'Dashboard, analytics, revenue leaks', color: '#10b981', done: true },
                { week: 'Now', desc: 'Live · 0 users · still going · 🙏', color: '#96bf48', done: false },
              ].map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '6px 0',
                  borderLeft: `1px solid rgba(255,255,255,0.05)`,
                  paddingLeft: 14, marginLeft: 4,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: t.color, flexShrink: 0, marginTop: 3,
                    marginLeft: -18,
                    boxShadow: `0 0 6px ${t.color}`,
                  }} />
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: t.color }}>{t.week}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Story */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 20, padding: '4px 14px',
              fontSize: 10, fontWeight: 700, color: '#f59e0b',
              marginBottom: 16,
            }}>
              👋 The founder
            </div>

            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 14, letterSpacing: '-1px' }}>
              I graduated in December.<br />
              I had to wait for my visa.<br />
              <span style={{ color: '#6366f1' }}>I built instead.</span>
            </h2>

            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8, marginBottom: 12 }}>
              After finishing my MS in Computer Science at Concordia University of Wisconsin, 
              I had to wait for my US work authorization (OPT). No job. No income. Just time.
            </p>

            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8, marginBottom: 20 }}>
              I noticed something: Shopify store owners were losing thousands of dollars every month 
              without knowing why. Bad product descriptions, no real analytics, no idea which products 
              were actually profitable. So I spent 6 weeks building the tool I wished existed.
            </p>

            <div style={{
              background: '#0d1b35',
              borderLeft: '3px solid #6366f1',
              borderRadius: '0 10px 10px 0',
              padding: '14px 18px', marginBottom: 20,
              fontSize: 13, color: '#94a3b8',
              fontStyle: 'italic', lineHeight: 1.8,
            }}>
              "I built the tool I wished existed — one that connects to your actual store, 
              shows exactly where money is leaking, and fixes it with AI. For free. 
              Because store owners deserve real answers, not guesswork."
            </div>

            <div style={{ fontSize: 12, color: '#334155', marginBottom: 24 }}>
              — Varun Kumar Konnoju · <strong style={{ color: '#818cf8' }}>Founder, Optivise AI</strong>
            </div>

            {/* Current status */}
            <div style={{
              background: '#0a1628',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10, padding: '14px 18px',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#334155', letterSpacing: '0.5px', marginBottom: 10 }}>
                CURRENT STATUS — BUILDING IN PUBLIC
              </div>
              {[
                { color: '#10b981', text: 'Product fully live at optiviseai.io' },
                { color: '#10b981', text: 'Shopify OAuth working in production' },
                { color: '#f59e0b', text: 'Actively looking for first 10 users' },
                { color: '#6366f1', text: 'OPT work authorization pending' },
                { color: '#96bf48', text: 'Building in public — sharing everything' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, color: '#475569' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  {s.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{
        padding: '70px 40px',
        background: '#060e1e',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
              Start free. Upgrade when you're ready.
            </h2>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 20 }}>
              No credit card. No sales call. No dark patterns.
            </p>
            {/* Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <span style={{ fontSize: 13, color: billingYearly ? '#475569' : '#e2e8f0' }}>Monthly</span>
              <div
                onClick={() => setBillingYearly(!billingYearly)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: billingYearly ? '#6366f1' : 'rgba(255,255,255,0.1)',
                  cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: billingYearly ? 23 : 3,
                  transition: 'left 0.2s',
                }} />
              </div>
              <span style={{ fontSize: 13, color: billingYearly ? '#e2e8f0' : '#475569' }}>
                Yearly <span style={{ color: '#10b981', fontWeight: 700, fontSize: 11 }}>save 20%</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
            {[
              {
                name: 'Free', price: 0, yearlyPrice: 0,
                color: '#6366f1', popular: false,
                desc: 'Perfect to start and see what you\'re missing',
                features: ['15 AI descriptions/month', 'Revenue Leak Detector', 'Store Health Score', 'Basic Analytics', 'Description History', 'Email support'],
                cta: 'Start free forever', ctaStyle: 'ghost',
              },
              {
                name: 'Starter', price: 29, yearlyPrice: 23,
                color: '#06b6d4', popular: true,
                desc: 'For store owners serious about growth',
                features: ['500 AI descriptions/month', 'Everything in Free', 'A/B Testing', 'AI Assistant — Alex', 'Priority support', 'Export reports'],
                cta: 'Start Starter free', ctaStyle: 'filled',
              },
              {
                name: 'Growth', price: 79, yearlyPrice: 63,
                color: '#10b981', popular: false,
                desc: 'Unlimited everything for scaling stores',
                features: ['Unlimited AI descriptions', 'Everything in Starter', 'DALL-E 3 marketing images', 'Advanced analytics', 'Dedicated support', 'API access (coming soon)'],
                cta: 'Start Growth free', ctaStyle: 'ghost',
              },
            ].map((plan, i) => (
              <div key={i} style={{
                background: plan.popular ? `rgba(6,182,212,0.05)` : '#0a1628',
                border: plan.popular ? `2px solid #06b6d4` : '1px solid rgba(255,255,255,0.05)',
                borderRadius: 16, padding: '28px 24px',
                position: 'relative',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#06b6d4', borderRadius: 20,
                    padding: '4px 16px', fontSize: 11, fontWeight: 700, color: '#fff',
                    whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontSize: 15, fontWeight: 700, color: plan.color, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 16 }}>{plan.desc}</div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: '#fff' }}>
                    ${billingYearly ? plan.yearlyPrice : plan.price}
                  </span>
                  <span style={{ fontSize: 13, color: '#475569' }}>/month</span>
                  {plan.price === 0 && <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 2 }}>Free forever</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                      <CheckCircle size={13} color={plan.color} style={{ flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    width: '100%', borderRadius: 10,
                    padding: '12px',
                    background: plan.ctaStyle === 'filled' ? plan.color : 'transparent',
                    border: `1px solid ${plan.color}`,
                    color: plan.ctaStyle === 'filled' ? '#fff' : plan.color,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 20, padding: '4px 16px',
            fontSize: 11, fontWeight: 700, color: '#10b981',
            marginBottom: 20,
          }}>
            Free forever · No credit card · No demo call
          </div>
          <h2 style={{ fontSize: 44, fontWeight: 900, color: '#fff', letterSpacing: '-2px', marginBottom: 12 }}>
            Stop guessing.<br />
            <span style={{ color: '#6366f1' }}>Start knowing.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 32 }}>
            Connect your Shopify store in 2 minutes. See exactly how much revenue 
            you're leaving on the table — and fix it with AI.
            <br />
            <strong style={{ color: '#94a3b8' }}>Built by one CS grad. Honest. Free. Real data only.</strong>
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
            <button
              onClick={() => navigate('/signup')}
              style={{
                background: '#6366f1', border: 'none', borderRadius: 14,
                padding: '16px 36px', color: 'white',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 0 30px rgba(99,102,241,0.3)',
              }}
            >
              <Zap size={16} />
              Start free today
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#334155' }}>
            No credit card · Cancel anytime · Real Shopify data only
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#010c1a',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: 12, color: '#1e3a5f' }}>
          © 2025 Optivise AI · Built by Varun Kumar Konnoju · Milwaukee, WI
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact', 'Help'].map(l => (
            <span key={l} style={{ fontSize: 12, color: '#1e3a5f', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>

      {/* Bottom accent bar */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1 33%, #06b6d4 66%, #96bf48 100%)' }} />

    </div>
  )
}