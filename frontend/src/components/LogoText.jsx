import { useState, useEffect } from 'react'

export default function LogoText({ nameSize = 22, tagSize = 9 }) {
  const taglines = ['FOR SHOPIFY', 'GROW WITH AI', 'SELL SMARTER', 'AI POWERED']
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setIndex(i => (i + 1) % taglines.length), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, alignItems: 'flex-start' }}>
      <span style={{
        fontSize: nameSize, fontWeight: 900,
        color: 'var(--text-primary)', letterSpacing: '-0.4px',
        whiteSpace: 'nowrap', display: 'block', width: '100%'
      }}>Optivise</span>
      <div style={{ overflow: 'hidden', height: tagSize * 2, marginTop: 3, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <span key={index} style={{
          fontSize: tagSize, fontWeight: 700, color: '#96BF48',
          letterSpacing: '1.5px', whiteSpace: 'nowrap',
          display: 'block', textAlign: 'center',
          animation: 'tagSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'
        }}>{taglines[index]}</span>
      </div>
      <style>{`@keyframes tagSlideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}