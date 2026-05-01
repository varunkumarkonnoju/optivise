import { useEffect, useRef, useState } from 'react'

export default function OptiviseLogo({ size = 40, showText = true, textSize = 18 }) {
  const iconRef = useRef(null)
  const [textIndex, setTextIndex] = useState(0)

  const taglines = ['FOR SHOPIFY', 'GROW WITH AI', 'SELL SMARTER', 'AI POWERED']

  useEffect(() => {
    const el = iconRef.current
    if (!el) return
    let frame
    let t = 0
    const animate = () => {
      t += 0.018
      const rotY = Math.sin(t) * 18
      const rotX = Math.cos(t * 0.6) * 8
      el.style.transform = `perspective(300px) rotateY(${rotY}deg) rotateX(${rotX}deg)`
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(i => (i + 1) % taglines.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Pure circular logo — no background box */}
      <div ref={iconRef} style={{
        width: size, height: size,
        flexShrink: 0,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        cursor: 'pointer',
        filter: 'drop-shadow(0 4px 12px rgba(99,102,241,0.7))'
      }}>
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {/* Outer circle — filled purple */}
          <circle cx="50" cy="50" r="48" fill="#6366F1"/>
          {/* Inner depth ring */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          {/* O ring */}
          <circle cx="50" cy="42" r="22" fill="none" stroke="white" strokeWidth="6"/>
          <circle cx="50" cy="42" r="13" fill="#4F46E5"/>
          {/* Bars */}
          <rect x="30" y="46" width="6" height="11" rx="2" fill="rgba(255,255,255,0.3)"/>
          <rect x="38" y="40" width="6" height="17" rx="2" fill="rgba(255,255,255,0.55)"/>
          <rect x="46" y="34" width="6" height="23" rx="2" fill="white"/>
          <rect x="54" y="38" width="6" height="19" rx="2" fill="rgba(255,255,255,0.55)"/>
          <rect x="62" y="29" width="6" height="28" rx="2" fill="white"/>
          {/* Shopify green trend */}
          <polyline points="33,43 41,36 49,30 57,34 65,26"
            fill="none" stroke="#96BF48" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="65" cy="26" r="4" fill="#96BF48"/>
          <circle cx="65" cy="26" r="2" fill="white"/>
          {/* Bottom baseline */}
          <line x1="24" y1="57" x2="76" y2="57" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          {/* Top shine */}
          <ellipse cx="42" cy="24" rx="14" ry="7" fill="rgba(255,255,255,0.12)" transform="rotate(-20 42 24)"/>
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontSize: textSize, fontWeight: 900,
            color: 'var(--text-primary)', letterSpacing: '-0.4px'
          }}>Optivise</span>

          {/* Animated rotating tagline */}
          <div style={{ height: textSize * 0.6, overflow: 'hidden', marginTop: 3 }}>
            <span key={textIndex} style={{
              fontSize: textSize * 0.52,
              fontWeight: 700,
              color: '#96BF48',
              letterSpacing: '1.2px',
              display: 'block',
              animation: 'tagSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            }}>
              {taglines[textIndex]}
            </span>
          </div>

          <style>{`
            @keyframes tagSlideIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}