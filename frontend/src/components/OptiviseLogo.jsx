export default function OptiviseLogo({ size = 40, showText = true, textSize = 18 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle */}
        <circle cx="50" cy="50" r="48" fill="#6366F1"/>
        {/* O ring */}
        <circle cx="50" cy="42" r="22" fill="none" stroke="white" strokeWidth="5"/>
        <circle cx="50" cy="42" r="14" fill="#4F46E5"/>
        {/* Bars inside O */}
        <rect x="30" y="46" width="5" height="10" rx="1" fill="rgba(255,255,255,0.4)"/>
        <rect x="37" y="42" width="5" height="14" rx="1" fill="rgba(255,255,255,0.6)"/>
        <rect x="44" y="37" width="5" height="19" rx="1" fill="white"/>
        <rect x="51" y="40" width="5" height="16" rx="1" fill="rgba(255,255,255,0.6)"/>
        <rect x="58" y="34" width="5" height="22" rx="1" fill="white"/>
        {/* Trend line - Shopify green */}
        <polyline points="32,44 39,39 46,34 53,37 60,31" fill="none" stroke="#96BF48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="60" cy="31" r="2.5" fill="#96BF48"/>
        {/* Bottom text OPTIVISE */}
        <text x="50" y="75" fontFamily="sans-serif" fontSize="11" fontWeight="900" fill="white" textAnchor="middle" letterSpacing="1">OPTIVISE</text>
        {/* Shopify green badge */}
        <rect x="15" y="80" width="70" height="14" rx="7" fill="#96BF48"/>
        <text x="50" y="90" fontFamily="sans-serif" fontSize="6" fontWeight="700" fill="white" textAnchor="middle" letterSpacing="1">FOR SHOPIFY</text>
      </svg>
      {showText && (
        <span style={{
          fontSize: textSize,
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px'
        }}>
          Optivise
        </span>
      )}
    </div>
  )
}