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

      const tiltX = Math.cos(t * 0.6) * 0.25
      const tiltY = Math.sin(t) * 0.35

      // Base circle
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
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 0.8
      for (let lat = -3; lat <= 3; lat++) {
        const y = cy + lat * (r / 3.5) + tiltX * r * 0.4
        const halfW = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy)))
        ctx.beginPath()
        ctx.ellipse(cx, y, halfW, halfW * 0.28, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Globe longitude lines
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI + t * 0.4
        ctx.beginPath()
        ctx.ellipse(cx, cy, r * Math.abs(Math.cos(angle)), r, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Clip to circle for inner content
      ctx.beginPath()
      ctx.arc(cx, cy, r - 1, 0, Math.PI * 2)
      ctx.clip()

      // Bar chart
      const barData = [0.45, 0.65, 0.9, 0.72, 1.0]
      const barW = size * 0.1
      const barGap = size * 0.04
      const totalW = barData.length * barW + (barData.length - 1) * barGap
      const startX = cx - totalW / 2
      const baseY = cy + size * 0.2
      const maxH = size * 0.42

      barData.forEach((h, i) => {
        const x = startX + i * (barW + barGap)
        const bh = h * maxH
        const alpha = 0.4 + h * 0.55
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.beginPath()
        ctx.roundRect(x, baseY - bh, barW, bh, 2)
        ctx.fill()
      })

      // Trend line - Shopify green
      ctx.strokeStyle = '#96BF48'
      ctx.lineWidth = 2.5
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.beginPath()
      barData.forEach((h, i) => {
        const x = startX + i * (barW + barGap) + barW / 2
        const y = baseY - h * maxH - 3
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Trend dots
      barData.forEach((h, i) => {
        const x = startX + i * (barW + barGap) + barW / 2
        const y = baseY - h * maxH - 3
        ctx.beginPath()
        ctx.arc(x, y, i === barData.length - 1 ? 3.5 : 2.5, 0, Math.PI * 2)
        ctx.fillStyle = i === barData.length - 1 ? 'white' : '#96BF48'
        ctx.fill()
      })

      // O ring
      const oR = size * 0.2
      const oX = cx + tiltY * size * 0.08
      const oY = cy - size * 0.08 + tiltX * size * 0.06
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = size * 0.06
      ctx.beginPath()
      ctx.arc(oX, oY, oR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#4F46E5'
      ctx.beginPath()
      ctx.arc(oX, oY, oR - size * 0.055, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      // Shine overlay
      const shine = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, 0, cx, cy, r)
      shine.addColorStop(0, 'rgba(255,255,255,0.18)')
      shine.addColorStop(0.45, 'rgba(255,255,255,0.04)')
      shine.addColorStop(1, 'rgba(0,0,0,0.15)')
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = shine
      ctx.fill()

      // Glow shadow
      ctx.shadowColor = 'rgba(99,102,241,0)'
      ctx.shadowBlur = 0

      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [size])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        filter: 'drop-shadow(0 4px 16px rgba(99,102,241,0.7))',
        flexShrink: 0
      }}>
        <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '50%' }}/>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontSize: textSize, fontWeight: 900,
            color: 'var(--text-primary)', letterSpacing: '-0.4px'
          }}>Optivise</span>
          <div style={{ height: textSize * 0.65, overflow: 'hidden', marginTop: 3 }}>
            <span key={textIndex} style={{
              fontSize: textSize * 0.52, fontWeight: 700,
              color: '#96BF48', letterSpacing: '1.2px',
              display: 'block',
              animation: 'tagSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'
            }}>
              {taglines[textIndex]}
            </span>
          </div>
          <style>{`@keyframes tagSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
        </div>
      )}
    </div>
  )
}