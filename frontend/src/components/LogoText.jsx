import { useState, useEffect } from 'react'

export default function LogoText({ nameSize = 22, tagSize = 9 }) {
  const taglines = ['FOR SHOPIFY', 'GROW WITH AI', 'SELL SMARTER', 'AI POWERED']
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setIndex(i => (i + 1) % taglines.length), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
      <span style={{
        fontSize: nameSize, fontWeight: 900,
        color: 'var(--text-primary)', letterSpacing: '-0.4px',
        whiteSpace: 'nowrap'
      }}>Optivise</span>
      <div style={{ height: tagSize * 1.8, overflow: 'hidden', marginTop: 3 }}>
        <span key={index} style={{
          fontSize: tagSize, fontWeight: 700, color: '#96BF48',
          letterSpacing: '1.5px', display: 'block', whiteSpace: 'nowrap',
          animation: 'tagSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'
        }}>{taglines[index]}</span>
      </div>
      <style>{`@keyframes tagSlideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}