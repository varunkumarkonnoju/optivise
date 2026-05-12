import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, CheckCircle, Zap, Play, Menu, X
} from 'lucide-react'
import OptiviseLogo from '../components/OptiviseLogo'
import LogoText from '../components/LogoText'
import VarunPhoto from '../assets/varun.png'

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
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

// ── LIVE AI DEMO ──────────────────────────────────────
function LiveDemo() {
  const [productName, setProductName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(0)

  const EXAMPLES = ['Leather Bag', 'Running Shoes', 'Wooden Watch', 'Silk Scarf', 'Wallet']

  const getMockResult = (name) => {
    const n = name.toLowerCase()
    const isPhone     = n.includes('iphone') || n.includes('phone') || n.includes('samsung') || n.includes('pixel')
    const isShoes     = n.includes('shoe') || n.includes('sneaker') || n.includes('boot') || n.includes('running')
    const isWatch     = n.includes('watch')
    const isScarf     = n.includes('scarf') || n.includes('silk')
    const isWallet    = n.includes('wallet')
    const isBag       = n.includes('bag') || n.includes('purse') || n.includes('backpack')
    const isGlasses   = n.includes('glass') || n.includes('sunglass') || n.includes('spectacle')
    const isJacket    = n.includes('jacket') || n.includes('coat') || n.includes('hoodie') || n.includes('sweater')
    const isJewelry   = n.includes('ring') || n.includes('necklace') || n.includes('bracelet') || n.includes('earring')
    const isShirt     = n.includes('shirt') || n.includes('tshirt') || n.includes('t-shirt') || n.includes('top') || n.includes('dress')
    const isPants     = n.includes('pant') || n.includes('jean') || n.includes('trouser') || n.includes('shorts')
    const isLaptop    = n.includes('laptop') || n.includes('macbook') || n.includes('computer') || n.includes('tablet') || n.includes('ipad')
    const isHeadphone = n.includes('headphone') || n.includes('airpod') || n.includes('earbud') || n.includes('earphone')
    const isPerfume   = n.includes('perfume') || n.includes('cologne') || n.includes('fragrance')
    const isSkincare  = n.includes('cream') || n.includes('serum') || n.includes('moisturizer') || n.includes('skincare')
    const isFurniture = n.includes('chair') || n.includes('desk') || n.includes('table') || n.includes('lamp') || n.includes('sofa')

    if (isPhone) return { before: `${name}. Latest model. Good camera. Fast processor. Multiple colors available.`, after: `<h2>The Phone That Does Everything — Beautifully</h2><p>Meet the ${name} — engineered for people who refuse to compromise.</p><ul><li>📸 Pro camera system with 5x optical zoom</li><li>🔋 All-day battery life that keeps up with you</li><li>🏆 Titanium design — lighter, stronger, premium</li></ul><p><strong>🚀 Order now. Ships in 1–2 business days.</strong></p>`, score: '+41% conversion predicted' }
    if (isShoes) return { before: `${name}. Comfortable fit. Good for running. Available in multiple sizes.`, after: `<h2>Run Further. Feel Less.</h2><p>The ${name} is engineered for runners who demand more from every mile.</p><ul><li>⚡ Energy-return foam for less fatigue</li><li>👣 Wide toe box for natural foot movement</li><li>💪 Durable outsole built for 500+ miles</li></ul><p><strong>🚚 Limited sizes remaining. Ships free.</strong></p>`, score: '+38% conversion predicted' }
    if (isWatch) return { before: `${name}. Stylish design. Good quality. Water resistant. Multiple colors.`, after: `<h2>Time, Worn With Intention</h2><p>The ${name} isn't just a timepiece — it's a statement about how you value your hours.</p><ul><li>Sapphire crystal glass — scratch-proof for life</li><li>Japanese movement — accurate to ±5 sec/day</li><li>100m water resistance for any adventure</li></ul><p><strong>Free engraving available. Ships in 3–5 days.</strong></p>`, score: '+36% conversion predicted' }
    if (isScarf) return { before: `${name}. Soft material. Beautiful colors. One size fits all.`, after: `<h2>Effortless Elegance, Every Day</h2><p>Woven from the finest silk, this ${name} drapes like a second skin.</p><ul><li>🌸 100% pure mulberry silk</li><li>✨ Hand-rolled edges for a couture finish</li><li>🌡️ Naturally temperature-regulating fabric</li></ul><p><strong>🎁 Gift wrapping available. Free returns.</strong></p>`, score: '+33% conversion predicted' }
    if (isWallet) return { before: `${name}. Slim design. Multiple card slots. Good quality leather.`, after: `<h2>Everything You Need. Nothing You Don't.</h2><p>The ${name} is built for the person who values function as much as form.</p><ul><li>💳 Holds 8 cards + cash without stretching</li><li>🛡️ RFID blocking — protect your data</li><li>🌿 Full-grain leather that ages beautifully</li></ul><p><strong>✏️ Personalization available. Ships same day.</strong></p>`, score: '+29% conversion predicted' }
    if (isBag) return { before: `${name}. Good quality. Multiple compartments. Adjustable strap.`, after: `<h2>The Bag That Goes Everywhere You Do</h2><p>The ${name} is designed for the person who needs to be ready for anything.</p><ul><li>🌿 Full-grain leather — develops character over time</li><li>💻 Padded laptop compartment fits up to 15"</li><li>🔒 Magnetic closure for easy one-handed access</li></ul><p><strong>🚚 Free shipping over $100. 30-day returns.</strong></p>`, score: '+34% conversion predicted' }
    if (isGlasses) return { before: `${name}. UV protection. Stylish frames. Multiple colors available.`, after: `<h2>See the World in Style</h2><p>The ${name} isn't just eye protection — it's a statement.</p><ul><li>☀️ 100% UV400 protection — blocks all harmful rays</li><li>🌊 Polarized lenses eliminate glare completely</li><li>🪶 Lightweight frame — forget you're wearing them</li></ul><p><strong>🎁 Free case and cloth included. Ships in 24 hours.</strong></p>`, score: '+31% conversion predicted' }
    if (isJacket) return { before: `${name}. Good material. Multiple sizes. Fast shipping available.`, after: `<h2>The Last ${name} You'll Ever Buy</h2><p>Built for people who refuse to compromise between style and function.</p><ul><li>🧵 Premium fabric that improves with every wear</li><li>✂️ Tailored fit that works on every body type</li><li>🎒 4 deep pockets — actually useful ones</li></ul><p><strong>🔄 Free returns within 30 days. Ships same day.</strong></p>`, score: '+35% conversion predicted' }
    if (isJewelry) return { before: `${name}. Beautiful design. Good quality. Great gift idea.`, after: `<h2>Worn Every Day. Treasured Forever.</h2><p>The ${name} is designed for people who believe everyday moments deserve beautiful things.</p><ul><li>✨ Tarnish-free — looks new after years of wear</li><li>💚 Hypoallergenic — safe for all skin types</li><li>🎁 Gift-ready packaging included free</li></ul><p><strong>✏️ Engrave it free. Ships in 2–3 days.</strong></p>`, score: '+38% conversion predicted' }
    if (isShirt) return { before: `${name}. Comfortable fabric. Multiple colors. Available in all sizes.`, after: `<h2>The ${name} That Goes With Everything</h2><p>Some clothes you wear. This one you live in.</p><ul><li>🌬️ Wrinkle-resistant — looks sharp all day</li><li>💧 Moisture-wicking fabric for all-day comfort</li><li>🔄 Pre-shrunk — fits the same after 100 washes</li></ul><p><strong>🔁 Free exchanges on size. Ships same day.</strong></p>`, score: '+29% conversion predicted' }
    if (isPants) return { before: `${name}. Comfortable fit. Good quality material. Multiple sizes available.`, after: `<h2>The ${name} That Finally Fits Right</h2><p>Built for real bodies doing real things.</p><ul><li>🤸 4-way stretch fabric — total freedom of movement</li><li>📐 Sits perfectly at the waist — no constant adjusting</li><li>🧺 Machine washable — no dry cleaning, ever</li></ul><p><strong>✂️ Free hemming service. Ships in 24 hours.</strong></p>`, score: '+32% conversion predicted' }
    if (isLaptop) return { before: `${name}. Fast processor. Good battery. Lightweight design.`, after: `<h2>Your Most Productive Tool Yet</h2><p>The ${name} is built for people who use their computer to build things and get things done.</p><ul><li>All-day battery — unplugged from 9am to 9pm</li><li>Blazing fast — apps open instantly, every time</li><li>Featherlight — barely notice it in your bag</li></ul><p><strong>Free setup support included. Ships next business day.</strong></p>`, score: '+33% conversion predicted' }
    if (isHeadphone) return { before: `${name}. Good sound quality. Comfortable fit. Long battery life.`, after: `<h2>Hear Everything. Hear It Better.</h2><p>The ${name} is engineered for people who take their audio seriously.</p><ul><li>🎵 Studio-quality sound tuned by audio engineers</li><li>🔇 Active noise cancellation — total focus, anywhere</li><li>🔋 32-hour battery — never die mid-commute again</li></ul><p><strong>🔄 Try for 30 days. Free shipping both ways.</strong></p>`, score: '+36% conversion predicted' }
    if (isPerfume) return { before: `${name}. Nice scent. Long lasting. Great for gifts.`, after: `<h2>The Scent People Will Ask About</h2><p>The ${name} opens with immediate presence and evolves beautifully throughout the day.</p><ul><li>⏱️ Long-lasting formula — 8-12 hours of wear</li><li>🇫🇷 Crafted by master perfumers in Grasse, France</li><li>🖤 Signature bottle — display-worthy on any vanity</li></ul><p><strong>🎁 Complimentary gift wrap available. Ships in 24 hours.</strong></p>`, score: '+40% conversion predicted' }
    if (isSkincare) return { before: `${name}. Good for skin. Natural ingredients. Suitable for all skin types.`, after: `<h2>The Skin You've Always Wanted Starts Here</h2><p>The ${name} is formulated with dermatologist-tested ingredients that actually work.</p><ul><li>🧪 Clinically tested — 94% saw visible improvement</li><li>🌿 Non-comedogenic — won't clog your pores</li><li>✅ Clean formula — free from parabens and sulfates</li></ul><p><strong>💯 14-day results guarantee. Free shipping over $40.</strong></p>`, score: '+42% conversion predicted' }
    if (isFurniture) return { before: `${name}. Good quality. Easy assembly. Multiple colors available.`, after: `<h2>The ${name} That Pulls the Room Together</h2><p>Some furniture fills space. This ${name} defines it.</p><ul><li>🪵 Solid hardwood construction — built for decades</li><li>⚡ Ships fully assembled — ready in minutes</li><li>🛡️ 5-year structural warranty included</li></ul><p><strong>🚚 White glove delivery available. Free returns within 60 days.</strong></p>`, score: '+30% conversion predicted' }
    return { before: `${name}. Good quality product. Fast shipping. Great value.`, after: `<h2>The ${name} — Built for People Who Demand More</h2><p>This isn't just another ${name}. Every detail has been considered, every material chosen for a reason.</p><ul><li>⭐ Premium materials selected for durability</li><li>🎯 Designed for real-world daily use</li><li>✅ Backed by our satisfaction guarantee</li></ul><p><strong>🚚 Limited stock. Free shipping. 30-day returns.</strong></p>`, score: '+28% conversion predicted' }
  }

  const steps = ['Analyzing product...', 'Writing SEO copy...', 'Optimizing for conversion...', 'Done! ✓']

  const runDemo = async () => {
    if (!productName.trim()) return
    setGenerating(true); setResult(null); setStep(0)
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700))
      setStep(i)
    }
    await new Promise(r => setTimeout(r, 400))
    setResult(getMockResult(productName))
    setGenerating(false)
  }

  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ background: '#0d1b35', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981' }} />
        <span style={{ marginLeft: 6, fontSize: 11, color: '#334155' }}>Optivise AI · Description Generator</span>
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, letterSpacing: '0.05em' }}>ENTER ANY PRODUCT NAME</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={productName} onChange={e => setProductName(e.target.value)} onKeyDown={e => e.key === 'Enter' && runDemo()} placeholder="e.g. Leather Crossbody Bag..."
            style={{ flex: 1, background: '#0d1b35', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
          <button onClick={runDemo} disabled={generating || !productName.trim()} style={{ background: generating ? 'rgba(99,102,241,0.5)' : '#6366f1', border: 'none', borderRadius: 8, padding: '9px 16px', color: 'white', fontSize: 12, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            <Sparkles size={12} />{generating ? 'Writing...' : 'Generate'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => setProductName(ex)} style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '2px 8px', fontSize: 10, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}>{ex}</button>
          ))}
        </div>

        {generating && (
          <div style={{ background: '#0d1b35', borderRadius: 10, padding: '12px', marginBottom: 12 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', opacity: i <= step ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: i < step ? '#10b981' : i === step ? '#6366f1' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0 }}>
                  {i < step ? '✓' : i === step ? '·' : ''}
                </div>
                <span style={{ fontSize: 11, color: i <= step ? '#94a3b8' : '#334155' }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {result && !generating && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '12px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>❌ BEFORE</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>{result.before}</div>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>✅ AFTER — AI optimized</div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: result.after }} />
              </div>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 600 }}>🎯 {result.score}</span>
              <span style={{ fontSize: 10, color: '#334155' }}>Preview — connect store to save</span>
            </div>
          </div>
        )}

        {!result && !generating && (
          <div style={{ textAlign: 'center', padding: '20px', background: '#0d1b35', borderRadius: 10 }}>
            <Sparkles size={22} color="#6366f1" style={{ marginBottom: 6, opacity: 0.6 }} />
            <div style={{ fontSize: 12, color: '#334155' }}>Type any product → see AI write description in real-time</div>
            <div style={{ fontSize: 10, color: '#1e3a5f', marginTop: 3 }}>No account needed for this preview</div>
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [billingYearly, setBillingYearly] = useState(false)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const NAV_LINKS = ['Features', 'How it works', 'Pricing', 'My story']

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
        .glow-btn { animation: glow 2s ease-in-out infinite; }
        .nav-links-desktop { display: flex; }
        .nav-menu-btn { display: none; }
        .mobile-menu { display: none; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-menu-btn { display: flex !important; }
          .mobile-menu { display: block; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-h1 { font-size: 36px !important; letter-spacing: -1.5px !important; }
          .hero-btns { flex-direction: column !important; }
          .hero-btns button { width: 100% !important; justify-content: center !important; }
          .hero-trust { flex-direction: column !important; gap: 10px !important; }
          .hero-card { animation: none !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .pain-grid { grid-template-columns: repeat(2,1fr) !important; }
          .before-after-grid { grid-template-columns: 1fr !important; }
          .arrow-divider { display: none !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .connector-line { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .founder-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 12px !important; text-align: center !important; }
          .section-pad { padding: 40px 20px !important; }
          .hero-section { padding: 40px 20px 32px !important; }
          .stats-bar { padding: 20px !important; }
          .nav-inner { padding: 12px 20px !important; }
          .announce-bar { font-size: 10px !important; padding: 8px 16px !important; }
          .before-after-stats { gap: 6px !important; }
          .pricing-toggle { flex-wrap: wrap; justify-content: center; }
        }

        @media (max-width: 480px) {
          .hero-h1 { font-size: 30px !important; }
          .pain-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="announce-bar" style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '10px 24px', textAlign: 'center', fontSize: 12, color: '#818cf8' }}>
        🎓 Built by a CS grad while waiting for a US work visa —{' '}
        <strong style={{ color: '#fff' }}>now live and completely free</strong>
        {' '}→{' '}
        <span onClick={() => navigate('/signup')} style={{ color: '#818cf8', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>
          Start free
        </span>
      </div>

      {/* ── STICKY NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: navScrolled ? 'rgba(2,8,23,0.97)' : 'rgba(2,8,23,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s ease',
      }}>
        {/* ── NAVBAR INNER — 3 SEPARATE COLUMNS ── */}
        <div className="nav-inner" style={{ padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* LEFT — Logo (completely independent) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <OptiviseLogo size={32} showText={false} />
            <LogoText nameSize={16} tagSize={7} />
          </div>

          {/* CENTER — Nav links (desktop only, in its own container) */}
          <div className="nav-links-desktop" style={{ gap: 28, alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {NAV_LINKS.map(item => (
              <a key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                onMouseLeave={e => e.target.style.color = '#64748b'}
              >
                {item}
              </a>
            ))}
          </div>

          {/* RIGHT — CTA buttons (desktop) + Hamburger (mobile) */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {/* Desktop CTAs */}
            <button onClick={() => navigate('/login')}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: '#64748b', fontSize: 12, cursor: 'pointer', display: 'flex' }}
              className="nav-links-desktop"
            >
              Log in
            </button>
            <button onClick={() => navigate('/signup')}
              className="glow-btn"
              style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '8px 18px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Start free →
            </button>
            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="nav-menu-btn"
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px', color: '#94a3b8', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="mobile-menu" style={{ background: '#0a1628', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px' }}>
            {NAV_LINKS.map(item => (
              <a key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '12px 0', fontSize: 14, color: '#94a3b8', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                {item}
              </a>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => navigate('/login')} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Log in</button>
              <button onClick={() => navigate('/signup')} style={{ flex: 1, background: '#6366f1', border: 'none', borderRadius: 8, padding: '10px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Start free</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ padding: '70px 40px 50px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="hero-grid slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '5px 12px', fontSize: 11, color: '#94a3b8', marginBottom: 20 }}>
              <img src={VarunPhoto} alt="Varun" style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 0 6px rgba(99,102,241,0.5))" }} />
              Built by Varun · CS grad · Concordia University, WI
            </div>

            <h1 className="hero-h1" style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2.5px', color: '#fff', marginBottom: 8 }}>
              Your Shopify<br />store is{' '}
              <span style={{ color: '#6366f1' }}>leaking</span><br />money.
            </h1>

            <p style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, fontStyle: 'italic', marginBottom: 14 }}>
              I found $2,400/month leaking from one test store. Here's the free tool I built to fix it.
            </p>

            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 28, maxWidth: 420 }}>
              Optivise connects to your real Shopify data and shows exactly where revenue is escaping —
              then fixes it with AI. <strong style={{ color: '#94a3b8' }}>No demo call. No credit card. 2 minutes.</strong>
            </p>

            <div className="hero-btns" style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <button onClick={() => navigate('/signup')} style={{ background: '#6366f1', border: 'none', borderRadius: 12, padding: '13px 24px', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={14} />Start free — 2 min setup
              </button>
              <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '13px 18px', color: '#94a3b8', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Play size={12} fill="#94a3b8" />Watch demo
              </button>
            </div>

            <div className="hero-trust" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {['Free forever', 'No credit card', 'Official Shopify OAuth', 'Read-only safe'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#10b981', flexShrink: 0 }}>✓</div>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="hero-card">
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="stats-bar" style={{ background: '#0a1628', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '24px 40px' }}>
        <div className="stats-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', textAlign: 'center', gap: 16 }}>
          {[
            { num: 216898, prefix: '$', suffix: '', label: 'Revenue analyzed from test store' },
            { num: 94, prefix: '', suffix: '/100', label: 'Store health score achieved' },
            { num: 6, prefix: '', suffix: ' weeks', label: 'Built the entire platform' },
            { num: 0, prefix: '', suffix: ' users', label: 'Honest count — day 1 of launch', honest: true },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.honest ? '#f59e0b' : '#fff' }}>
                {s.prefix}<AnimatedCounter target={s.num} duration={1800} />{s.suffix}
              </div>
              <div style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>{s.label}</div>
              {s.honest && <div style={{ fontSize: 9, color: '#f59e0b', marginTop: 3, fontWeight: 600 }}>I'm being honest. This is day 1.</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── PAIN POINTS ── */}
      <section id="features" className="section-pad" style={{ padding: '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '3px 12px', fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '1px', marginBottom: 10 }}>THE REAL PROBLEM</div>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
            Most Shopify store owners<br /><span style={{ color: '#ef4444' }}>are flying blind.</span>
          </h2>
          <p style={{ fontSize: 14, color: '#475569', maxWidth: 480, margin: '0 auto' }}>These are the 5 exact problems Shopify store owners face every day.</p>
        </div>
        <div className="pain-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
          {[
            { icon: '📝', problem: '"My product descriptions are terrible but I don\'t know how to fix them"', loss: '-$720/mo' },
            { icon: '📊', problem: '"I have no idea which of my 47 products are actually making me money"', loss: '-$1,200/mo' },
            { icon: '💸', problem: '"I spent $300 on Facebook ads last week — I have no idea if it worked"', loss: '-$900/mo' },
            { icon: '🛒', problem: '"My conversion rate is 1.2% and I don\'t know why people aren\'t buying"', loss: '-$1,800/mo' },
            { icon: '😤', problem: '"I have 15 tabs open and no single tool that shows me what\'s wrong"', loss: '-$600/mo' },
          ].map((p, i) => (
            <div key={i} className="hover-card" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '18px 14px' }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{p.icon}</div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, marginBottom: 10 }}>{p.problem}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.08)', borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>{p.loss}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="section-pad" style={{ padding: '60px 40px', background: '#060e1e', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '3px 12px', fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: '1px', marginBottom: 10 }}>REAL EXAMPLE</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 6 }}>What AI descriptions actually look like</h2>
            <p style={{ fontSize: 13, color: '#475569' }}>Same product. 30 seconds apart. Completely different result.</p>
          </div>
          <div className="before-after-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'stretch' }}>
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ background: 'rgba(239,68,68,0.15)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#ef4444' }}>❌ BEFORE</div>
                <span style={{ fontSize: 11, color: '#475569' }}>What most store owners write</span>
              </div>
              <div style={{ background: '#0a1628', borderRadius: 8, padding: '12px', fontSize: 12, color: '#64748b', lineHeight: 1.8, fontStyle: 'italic' }}>
                "Premium leather jacket. Size M/L/XL. Black color. Multiple pockets. Good quality material. Fast shipping available."
              </div>
              <div className="before-after-stats" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {[['1.1%', 'conversion'], ['F', 'SEO score'], ['4s', 'bounce']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#ef4444' }}>{v}</div>
                    <div style={{ fontSize: 9, color: '#475569' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="arrow-divider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#6366f1', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
            </div>

            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ background: 'rgba(16,185,129,0.15)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#10b981' }}>✅ AFTER</div>
                <span style={{ fontSize: 11, color: '#475569' }}>Optivise AI · 30 seconds</span>
              </div>
              <div style={{ background: '#0a1628', borderRadius: 8, padding: '12px', fontSize: 12, color: '#94a3b8', lineHeight: 1.8 }}>
                <strong style={{ color: '#f1f5f9' }}>The Last Jacket You'll Ever Need.</strong><br />
                Crafted from full-grain leather that develops a rich patina over time, this jacket is designed for people who refuse to compromise. Four deep pockets. A cut that works at the office and after hours.<br /><br />
                <span style={{ color: '#10b981' }}>★ Backed by 30-day returns. Ships in 24 hours.</span>
              </div>
              <div className="before-after-stats" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {[['4.2%', 'conversion'], ['A', 'SEO score'], ['3.8×', 'time on page']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#10b981' }}>{v}</div>
                    <div style={{ fontSize: 9, color: '#475569' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '7px 16px', fontSize: 11, color: '#818cf8' }}>
              Try it yourself above ↑ — type any product name, no sign-up needed
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section-pad" style={{ padding: '60px 40px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '3px 12px', fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: '1px', marginBottom: 10 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 6 }}>From zero to growing — in 3 steps</h2>
          <p style={{ fontSize: 13, color: '#475569' }}>No developers. No complicated setup. Just your Shopify store URL.</p>
        </div>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, position: 'relative' }}>
          <div className="connector-line" style={{ position: 'absolute', top: 40, left: '17%', right: '17%', height: 1, background: 'linear-gradient(90deg,#6366f1,#06b6d4,#10b981)', opacity: 0.3, zIndex: 0 }} />
          {[
            { step: '01', color: '#6366f1', icon: '🔗', title: 'Connect your store', desc: 'Authorize with official Shopify OAuth — we pull your real products, orders and revenue. Takes 90 seconds.', detail: 'Read-only. We never modify without permission.' },
            { step: '02', color: '#06b6d4', icon: '🤖', title: 'AI scans everything', desc: 'Our AI analyzes every product, your conversion rate, and compares against high-performing stores.', detail: 'GPT-4o powered analysis on your real data.' },
            { step: '03', color: '#10b981', icon: '🚀', title: 'Fix and grow', desc: 'Get exact recommendations ranked by revenue impact. Generate AI descriptions in 1 click. Watch revenue grow.', detail: 'Average improvement visible within 7 days.' },
          ].map((s, i) => (
            <div key={i} className="hover-card" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '24px 20px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.color, marginBottom: 6, letterSpacing: '1px' }}>STEP {s.step}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.7, marginBottom: 10 }}>{s.desc}</div>
              <div style={{ fontSize: 10, color: s.color, fontWeight: 600, background: `${s.color}08`, borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>{s.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section-pad" style={{ padding: '60px 40px', background: '#060e1e', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 6 }}>Built from scratch. By one person.</h2>
            <p style={{ fontSize: 13, color: '#475569' }}>No templates. No no-code tools. Java + React + 6 weeks of late nights.</p>
          </div>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { icon: '✨', color: '#6366f1', title: 'AI Product Descriptions', desc: '1-click AI rewrites for any product. Saves directly to Shopify. Original always backed up.', badge: 'Most used' },
              { icon: '📉', color: '#ef4444', title: 'Revenue Leak Detector', desc: 'AI finds exactly where you\'re losing money — with dollar amounts and one-click fixes.', badge: 'Most valuable' },
              { icon: '🏥', color: '#10b981', title: 'Store Health Score', desc: '0–100 animated health check. 6 detailed checks. See what\'s working and what\'s hurting.', badge: null },
              { icon: '📊', color: '#06b6d4', title: 'Real Analytics', desc: 'Revenue, orders, conversion — all from your actual Shopify data. Not estimates.', badge: null },
              { icon: '🧪', color: '#f59e0b', title: 'A/B Testing', desc: 'Test two versions of any product description. Let data decide which converts better.', badge: null },
              { icon: '↩', color: '#96bf48', title: 'Description History', desc: 'Every original description backed up. Restore in one click. Forever.', badge: 'Peace of mind' },
            ].map((f, i) => (
              <div key={i} className="hover-card" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '20px', position: 'relative' }}>
                {f.badge && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: `${f.color}15`, border: `1px solid ${f.color}30`, borderRadius: 20, padding: '2px 7px', fontSize: 9, fontWeight: 700, color: f.color }}>{f.badge}</div>
                )}
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${f.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.7 }}>{f.desc}</div>
                <div style={{ height: 3, borderRadius: 2, marginTop: 12, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: f.color, width: `${[88,92,78,85,72,70][i]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDER STORY ── */}
      <section id="my-story" className="section-pad" style={{ padding: '60px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <div className="founder-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 56, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <img src={VarunPhoto} alt="Varun Kumar Konnoju" style={{ width: 140, height: 140, objectFit: 'contain', filter: 'drop-shadow(0 0 24px rgba(99,102,241,0.5))' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Varun Kumar Konnoju</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>MS Computer Science</div>
              <div style={{ fontSize: 11, color: '#475569' }}>Concordia University of Wisconsin</div>
              <div style={{ fontSize: 11, color: '#6366f1', marginTop: 2, fontWeight: 600 }}>Founder, Optivise AI</div>
            </div>
            <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 18px', width: '100%' }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: '#334155', letterSpacing: '0.5px', marginBottom: 10 }}>BUILD TIMELINE</div>
              {[
                { week: 'Wk 1–2', desc: 'Auth system, database, accounts', color: '#6366f1' },
                { week: 'Wk 3', desc: 'Shopify OAuth + real store data', color: '#06b6d4' },
                { week: 'Wk 4', desc: 'AI descriptions + GPT-4o', color: '#f59e0b' },
                { week: 'Wk 5–6', desc: 'Dashboard, analytics, revenue leaks', color: '#10b981' },
                { week: 'Now', desc: 'Live · 0 users · still going 🙏', color: '#96bf48' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 12, marginLeft: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, flexShrink: 0, marginTop: 3, marginLeft: -16, boxShadow: `0 0 5px ${t.color}` }} />
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: t.color }}>{t.week}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 10, fontWeight: 700, color: '#f59e0b', marginBottom: 14 }}>👋 The founder</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 12, letterSpacing: '-1px' }}>
              I graduated in December.<br />I had to wait for my visa.<br /><span style={{ color: '#6366f1' }}>I built instead.</span>
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8, marginBottom: 10 }}>After finishing my MS in Computer Science at Concordia University of Wisconsin, I had to wait for my US work authorization. No job. No income. Just time.</p>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8, marginBottom: 16 }}>I noticed Shopify store owners were losing thousands every month without knowing why. So I spent 6 weeks building the tool I wished existed.</p>
            <div style={{ background: '#0d1b35', borderLeft: '3px solid #6366f1', borderRadius: '0 10px 10px 0', padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.8 }}>
              "I built the tool I wished existed — connects to your actual store, shows exactly where money is leaking, and fixes it with AI. For free."
            </div>
            <div style={{ fontSize: 11, color: '#334155', marginBottom: 20 }}>— Varun Kumar Konnoju · <strong style={{ color: '#818cf8' }}>Founder, Optivise AI</strong></div>
            <div style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: '#334155', letterSpacing: '0.5px', marginBottom: 8 }}>CURRENT STATUS — BUILDING IN PUBLIC</div>
              {[
                { color: '#10b981', text: 'Product fully live at optiviseai.io' },
                { color: '#10b981', text: 'Shopify OAuth working in production' },
                { color: '#f59e0b', text: 'Looking for first 10 users right now' },
                { color: '#6366f1', text: 'OPT work authorization pending' },
                { color: '#96bf48', text: 'Building in public — sharing everything' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0', fontSize: 11, color: '#475569' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  {s.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="section-pad" style={{ padding: '60px 40px', background: '#060e1e', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 6 }}>Start free. Upgrade when you're ready.</h2>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 18 }}>No credit card. No sales call. No dark patterns.</p>
            <div className="pricing-toggle" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <span style={{ fontSize: 13, color: billingYearly ? '#475569' : '#e2e8f0' }}>Monthly</span>
              <div onClick={() => setBillingYearly(!billingYearly)} style={{ width: 44, height: 24, borderRadius: 12, background: billingYearly ? '#6366f1' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: billingYearly ? 23 : 3, transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontSize: 13, color: billingYearly ? '#e2e8f0' : '#475569' }}>Yearly <span style={{ color: '#10b981', fontWeight: 700, fontSize: 11 }}>save 20%</span></span>
            </div>
          </div>
          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, alignItems: 'start' }}>
            {[
              { name: 'Free', price: 0, yearlyPrice: 0, color: '#6366f1', popular: false, desc: 'Perfect to start', features: ['15 AI descriptions/month', 'Revenue Leak Detector', 'Store Health Score', 'Basic Analytics', 'Description History', 'Email support'], cta: 'Start free forever', ctaStyle: 'ghost' },
              { name: 'Starter', price: 29, yearlyPrice: 23, color: '#06b6d4', popular: true, desc: 'For serious growth', features: ['500 AI descriptions/month', 'Everything in Free', 'A/B Testing', 'AI Assistant — Alex', 'Priority support', 'Export reports'], cta: 'Start Starter free', ctaStyle: 'filled' },
              { name: 'Growth', price: 79, yearlyPrice: 63, color: '#10b981', popular: false, desc: 'Unlimited everything', features: ['Unlimited AI descriptions', 'Everything in Starter', 'DALL-E 3 images', 'Advanced analytics', 'Dedicated support', 'API access (soon)'], cta: 'Start Growth free', ctaStyle: 'ghost' },
            ].map((plan, i) => (
              <div key={i} style={{ background: plan.popular ? 'rgba(6,182,212,0.05)' : '#0a1628', border: plan.popular ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '24px 20px', position: 'relative' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#06b6d4', borderRadius: 20, padding: '3px 14px', fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>Most Popular</div>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, color: plan.color, marginBottom: 3 }}>{plan.name}</div>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 14 }}>{plan.desc}</div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>${billingYearly ? plan.yearlyPrice : plan.price}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>/mo</span>
                  {plan.price === 0 && <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600, marginTop: 2 }}>Free forever</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#64748b' }}>
                      <CheckCircle size={11} color={plan.color} style={{ flexShrink: 0 }} />{f}
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/signup')} style={{ width: '100%', borderRadius: 10, padding: '11px', background: plan.ctaStyle === 'filled' ? plan.color : 'transparent', border: `1px solid ${plan.color}`, color: plan.ctaStyle === 'filled' ? '#fff' : plan.color, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section-pad" style={{ padding: '70px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '4px 14px', fontSize: 10, fontWeight: 700, color: '#10b981', marginBottom: 16 }}>Free forever · No credit card · No demo call</div>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-2px', marginBottom: 10 }}>Stop guessing.<br /><span style={{ color: '#6366f1' }}>Start knowing.</span></h2>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 28 }}>
            Connect your Shopify store in 2 minutes. See exactly how much revenue you're leaving on the table.<br />
            <strong style={{ color: '#94a3b8' }}>Built by one CS grad. Honest. Free. Real data only.</strong>
          </p>
          <button onClick={() => navigate('/signup')} style={{ background: '#6366f1', border: 'none', borderRadius: 14, padding: '15px 32px', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 30px rgba(99,102,241,0.3)', marginBottom: 12 }}>
            <Zap size={15} />Start free today
          </button>
          <div style={{ fontSize: 11, color: '#334155' }}>No credit card · Cancel anytime · Real Shopify data only</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#010c1a', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '24px 40px' }}>
        <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: '#1e3a5f' }}>© 2025 Optivise AI · Built by Varun Kumar Konnoju · Milwaukee, WI</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy', 'Terms', 'Contact', 'Help'].map(l => (
              <span key={l} style={{ fontSize: 11, color: '#1e3a5f', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
      <div style={{ height: 4, background: 'linear-gradient(90deg,#6366f1 33%,#06b6d4 66%,#96bf48 100%)' }} />
    </div>
  )
}