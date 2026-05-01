import { useEffect, useRef, useState } from 'react'

export default function OptiviseLogo({ size = 40, showText = true, textSize = 18 }) {
  const canvasRef = useRef(null)
  const [textIndex, setTextIndex] = useState(0)
  const taglines = ['FOR SHOPIFY', 'GROW WITH AI', 'SELL SMARTER', 'AI POWERED']

  useEffect(() => {
    const interval = setInterval(() => setTextIndex(i => (i + 1) % taglines.length), 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const s = size * dpr
    canvas.width = s
    canvas.height = s
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const r = size / 2 - 1
    let t = 0
    let frame

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      t += 0.018

      // Base circle background
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r)
      grad.addColorStop(0, '#818CF8')
      grad.addColorStop(0.5, '#6366F1')
      grad.addColorStop(1, '#3730A3')
      ctx.fillStyle = grad
      ctx.fill()

      // Globe latitude lines
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 0.7
      for (let lat = -3; lat <= 3; lat++) {
        const y = cy + lat * (r / 3.8)
        const halfW = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy)))
        ctx.beginPath()
        ctx.ellipse(cx, y, halfW, halfW * 0.25, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Globe longitude lines (rotating)
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI + t * 0.4
        ctx.beginPath()
        ctx.ellipse(cx, cy, r * Math.abs(Math.cos(angle)), r, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Clip to circle
      ctx.beginPath()
      ctx.arc(cx, cy, r - 1, 0, Math.PI * 2)
      ctx.clip()

      // ── BAR CHART (main focus, no O ring blocking) ──
      const barData = [0.42, 0.62, 0.85, 0.68, 1.0]
      const barW = size * 0.11
      const barGap = size * 0.035
      const totalW = barData.length * barW + (barData.length - 1) * barGap
      const startX = cx - totalW / 2
      const baseY = cy + size * 0.22
      const maxH = size * 0.48

      // Draw bars
      barData.forEach((h, i) => {
        const x = startX + i * (barW + barGap)
        const bh = h * maxH
        // Gradient on each bar
        const barGrad = ctx.createLinearGradient(x, baseY - bh, x, baseY)
        barGrad.addColorStop(0, `rgba(255,255,255,${0.5 + h * 0.4})`)
        barGrad.addColorStop(1, `rgba(255,255,255,${0.15 + h * 0.15})`)
        ctx.fillStyle = barGrad
        ctx.beginPath()
        ctx.roundRect(x, baseY - bh, barW, bh, 3)
        ctx.fill()
      })

      // Baseline
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(startX - 2, baseY)
      ctx.lineTo(startX + totalW + 2, baseY)
      ctx.stroke()

      // ── SHOPIFY GREEN TREND LINE ──
      ctx.strokeStyle = '#96BF48'
      ctx.lineWidth = size * 0.055
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.shadowColor = '#96BF48'
      ctx.shadowBlur = size * 0.08
      ctx.beginPath()
      barData.forEach((h, i) => {
        const x = startX + i * (barW + barGap) + barW / 2
        const y = baseY - h * maxH - size * 0.04
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.shadowBlur = 0

      // Trend dots
      barData.forEach((h, i) => {
        const x = startX + i * (barW + barGap) + barW / 2
        const y = baseY - h * maxH - size * 0.04
        const isLast = i === barData.length - 1
        ctx.beginPath()
        ctx.arc(x, y, isLast ? size * 0.06 : size * 0.04, 0, Math.PI * 2)
        ctx.fillStyle = isLast ? 'white' : '#96BF48'
        ctx.fill()
        if (isLast) {
          // Pulse ring on last dot
          ctx.beginPath()
          ctx.arc(x, y, size * 0.08, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(150,191,72,0.5)'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      })

      ctx.restore()

      // Shine overlay
      const shine = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.42, 0, cx, cy, r)
      shine.addColorStop(0, 'rgba(255,255,255,0.22)')
      shine.addColorStop(0.4, 'rgba(255,255,255,0.05)')
      shine.addColorStop(1, 'rgba(0,0,0,0.2)')
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = shine
      ctx.fill()

      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [size])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ filter: 'drop-shadow(0 4px 16px rgba(99,102,241,0.7))', flexShrink: 0 }}>
        <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '50%' }}/>
      </div>
      {showText && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          lineHeight: 1, fontFamily: 'inherit',
          flexShrink: 0
        }}>
          <span style={{
            fontSize: textSize, fontWeight: 900,
            color: 'var(--text-primary)', letterSpacing: '-0.4px',
            whiteSpace: 'nowrap', display: 'block',
            fontFamily: 'inherit'
          }}>Optivise</span>
          <div style={{ overflow: 'hidden', height: Math.round(textSize * 0.65), marginTop: 4 }}>
            <span key={textIndex} style={{
              fontSize: Math.round(textSize * 0.5),
              fontWeight: 700, color: '#96BF48',
              letterSpacing: '1.5px', display: 'block',
              whiteSpace: 'nowrap', fontFamily: 'inherit',
              animation: 'tagSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'
            }}>{taglines[textIndex]}</span>
          </div>
          <style>{`@keyframes tagSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}
    </div>
  )
}