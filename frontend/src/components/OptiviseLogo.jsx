import { useEffect, useRef } from 'react'

export default function OptiviseLogo({ size = 40, showText = true, textSize = 18 }) {
  const iconRef = useRef(null)

  useEffect(() => {
    const el = iconRef.current
    if (!el) return

    let frame
    let t = 0

    const animate = () => {
      t += 0.02
      const rotY = Math.sin(t) * 12
      const rotX = Math.cos(t * 0.7) * 6
      const scale = 1 + Math.sin(t * 1.3) * 0.04
      el.style.transform = `perspective(200px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`
      frame = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div ref={iconRef} style={{
        width: size, height: size,
        borderRadius: size * 0.28,
        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #7C3AED 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 24px rgba(99,102,241,0.6), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        cursor: 'pointer'
      }}>
        {/* Top shine */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
          borderRadius: `${size * 0.28}px ${size * 0.28}px 0 0`,
          pointerEvents: 'none'
        }}/>
        {/* Bottom reflection */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)',
          borderRadius: `0 0 ${size * 0.28}px ${size * 0.28}px`,
          pointerEvents: 'none'
        }}/>
        <svg viewBox="0 0 100 100" width={size * 0.6} height={size * 0.6}>
          {/* O ring */}
          <circle cx="50" cy="42" r="24" fill="none" stroke="white" strokeWidth="7"/>
          <circle cx="50" cy="42" r="14" fill="#4F46E5"/>
          {/* Bars */}
          <rect x="29" y="46" width="7" height="12" rx="2" fill="rgba(255,255,255,0.3)"/>
          <rect x="38" y="40" width="7" height="18" rx="2" fill="rgba(255,255,255,0.5)"/>
          <rect x="47" y="33" width="7" height="25" rx="2" fill="white"/>
          <rect x="56" y="37" width="7" height="21" rx="2" fill="rgba(255,255,255,0.5)"/>
          <rect x="65" y="28" width="7" height="30" rx="2" fill="white"/>
          {/* Shopify green trend */}
          <polyline points="32,43 41,36 50,29 59,33 68,25"
            fill="none" stroke="#96BF48" strokeWidth="3.5"
            strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="68" cy="25" r="4" fill="#96BF48"/>
          <circle cx="68" cy="25" r="2" fill="white"/>
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontSize: textSize, fontWeight: 900,
            color: 'var(--text-primary)', letterSpacing: '-0.4px'
          }}>Optivise</span>
          <span style={{
            fontSize: textSize * 0.5, fontWeight: 700,
            color: '#96BF48', letterSpacing: '1.5px', marginTop: 2
          }}>FOR SHOPIFY</span>
        </div>
      )}
    </div>
  )
}